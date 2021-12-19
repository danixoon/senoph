import { getChanges, getUpdater } from "@backend/db/commit";
import { access, owner, withOwner, withUser } from "@backend/middleware/auth";
import { convertValues } from "@backend/middleware/converter";
import { tester, validate } from "@backend/middleware/validator";
import { Router } from "express";
import { AppRouter } from "../router";

import Model from "../db/models/phoneModel.model";
import Commit, {
  validActionTypes,
  validTargetNames,
} from "@backend/db/models/commit.model";
import { Filter, WhereFilter } from "@backend/utils/db";
import { Op } from "sequelize";
import { getModel } from "../db";
import { transactionHandler, prepareItems } from "../utils";
import Phone from "@backend/db/models/phone.model";
import { ApiError, errorType } from "@backend/utils/errors";
import Holding from "@backend/db/models/holding.model";
import Category from "@backend/db/models/category.model";
import Log from "@backend/db/models/log.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import CategoryPhone from "@backend/db/models/categoryPhone.model";
import Change from "@backend/db/models/change.model";

const router = AppRouter();

router.get(
  "/commit",
  access("user"),
  validate({ query: { target: tester().required() } }),
  async (req, res) => {
    // const { id } = req.params.user;
    const { target } = req.query;
    const changes = Object.entries(await getChanges(target)).reduce(
      (acc, [authorId, value]) => [
        ...acc,
        ...Object.entries(value).reduce(
          (acc, [targetId, changes]) => [
            ...acc,
            { ...changes, id: Number(targetId), authorId: Number(authorId) },
          ],
          []
        ),
      ],
      [] as any[]
    );

    changes.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

    res.send(prepareItems(changes, changes.length, 0));
  }
);

// Подтверждение изменения?
router.put(
  "/commit",
  access("admin"),
  validate({
    query: {
      target: tester().required(),
      targetId: tester().isNumber().required(),
      userId: tester().isNumber(),
    },
  }),
  // TODO: Сделать проверку на владельца изменений
  transactionHandler(async (req, res, next) => {
    const { target, targetId, userId } = req.query;
    const { id, role } = req.params.user;

    if (role === "user" && userId && userId !== id)
      throw new ApiError(errorType.ACCESS_DENIED, {
        description:
          "Применить изменение невозможно т.к. вы не являетесь его автором.",
      });

    const targetUserId = userId ?? id;

    const updater = getUpdater(target, targetId, targetUserId);
    await updater.commit();

    // Log.log("phone", [targetId], "change", id);

    res.send();
  })
);

// router.get(
//   "/commit/entity",
//   access("user"),
//   // validate({
//   //   query: {},
//   // }),
//   async (req, res) => {
//     const { id } = req.params.user;
//     const query = { userId: id };

//     const filter = new Filter(query).add("userId");

//     const commits = await Commit.findAll({ where: filter.where });
//     const items = commits.map((commit) => ({
//       id: commit.id,
//       action: commit.action,
//       target: commit.target,
//     }));

//     res.send(prepareItems(items, items.length, 0));
//   }
// );

// Создание изменения
router.post(
  "/commit",
  access("user"),
  validate({
    query: {
      target: tester().required(),
      targetId: tester().required(),
    },
  }),
  // owner("phone", (r) => r.query.targetId),
  transactionHandler(async (req, res) => {
    const { id } = req.params.user;
    const { target, targetId } = req.query;
    const changes = req.body;

    const updater = getUpdater(target, targetId, id);
    await updater.push(changes);

    // Log.log("phone", [targetId], "commit", id);

    res.send();
  })
);

router.put(
  "/commit/holding",
  access("user"),
  validate({
    body: {
      action: tester().isIn(["approve", "decline"]).required(),
      ids: tester().array("int"),
    },
  }),
  /* owner("") ,*/ transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { action, ids } = req.body;
    const holdings = await Holding.findAll({ where: { id: { [Op.in]: ids } } });

    await Promise.all(
      holdings.map(async (holding) => {
        if (action === "approve") {
          if (user.role !== "admin")
            throw new ApiError(errorType.ACCESS_DENIED);
          if (holding.status === "create-pending") {
            await holding.update({ status: null });
          } else if (holding.status === "delete-pending") {
            await holding.destroy();
          }
        } else {
          if (user.role === "user" && holding.statusId !== user.id)
            throw new ApiError(errorType.ACCESS_DENIED, {
              description: "Вы не являетесь автором данного движения.",
            });
          if (holding.status === "create-pending") {
            await holding.destroy();
          } else if (holding.status === "delete-pending") {
            await holding.update({ status: null });
          }
        }
      })
    );

    Log.log("holding", ids, "commit", user.id, { action });

    res.send();
  })
);

router.put(
  "/commit/holding/phone",
  access("user"),
  validate({
    body: {
      action: tester().isIn(["approve", "decline"]).required(),
      phoneIds: tester().array("int"),
      holdingId: tester().isNumber(),
    },
  }),
  /* owner("") ,*/ transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { action, phoneIds, holdingId } = req.body;
    const holdingPhones = await HoldingPhone.findAll({
      where: {
        phoneId: { [Op.in]: phoneIds },
        holdingId,
        status: { [Op.not]: null },
      },
    });

    if (holdingPhones.length !== phoneIds.length)
      throw new ApiError(errorType.INVALID_QUERY, {
        description:
          "Один или несколько ID средств связи не ожидают изменения.",
      });

    await Promise.all(
      holdingPhones.map(async (holdingPhone) => {
        if (action === "approve") {
          if (user.role === "user") throw new ApiError(errorType.ACCESS_DENIED);
          if (holdingPhone.status === "create-pending") {
            await holdingPhone.update({
              status: null,
              statusAt: new Date().toISOString(),
            });
          } else if (holdingPhone.status === "delete-pending") {
            await holdingPhone.destroy();
          }
        } else if (action === "decline") {
          if (user.role === "user" && holdingPhone.authorId !== user.id)
            throw new ApiError(errorType.ACCESS_DENIED, {
              description: "Вы не являетесь автором данного изменения.",
            });
          if (holdingPhone.status === "create-pending") {
            await holdingPhone.destroy();
          } else if (holdingPhone.status === "delete-pending") {
            await holdingPhone.update({
              status: null,
              statusAt: new Date().toISOString(),
            });
          }
        }
      })
    );

    Log.log("holdingPhone", phoneIds, "commit", user.id, { action, holdingId });

    res.send();
  })
);

router.put(
  "/commit/category/phone",
  access("admin"),
  validate({
    body: {
      action: tester().isIn(["approve", "decline"]).required(),
      phoneIds: tester().array("int"),
      categoryId: tester().isNumber(),
    },
  }),
  /* owner("") ,*/ transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { action, phoneIds, categoryId } = req.body;
    const categoryPhones = await CategoryPhone.findAll({
      where: {
        phoneId: { [Op.in]: phoneIds },
        categoryId,
        status: { [Op.not]: null },
      },
    });

    if (categoryPhones.length !== phoneIds.length)
      throw new ApiError(errorType.INVALID_QUERY, {
        description:
          "Один или несколько ID средств связи не ожидают изменения.",
      });

    await Promise.all(
      categoryPhones.map(async (categoryPhone) => {
        if (action === "approve") {
          if (categoryPhone.status === "create-pending") {
            await categoryPhone.update({
              status: null,
              statusAt: new Date().toISOString(),
            });
          } else if (categoryPhone.status === "delete-pending") {
            await categoryPhone.destroy();
          }
        } else {
          if (categoryPhone.status === "create-pending") {
            await categoryPhone.destroy();
          } else if (categoryPhone.status === "delete-pending") {
            await categoryPhone.update({
              status: null,
              statusAt: new Date().toISOString(),
            });
          }
        }
      })
    );

    Log.log("categoryPhone", phoneIds, "commit", user.id, {
      action,
      categoryId,
    });

    res.send();
  })
);

router.put(
  "/commit/category",
  access("admin"),
  validate({
    body: {
      action: tester().isIn(["approve", "decline"]).required(),
      ids: tester().array("int"),
    },
  }),
  /* owner("") ,*/ transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { action, ids } = req.body;
    const categories = await Category.findAll({
      where: { id: { [Op.in]: ids } },
    });

    await Promise.all(
      categories.map(async (category) => {
        if (action === "approve") {
          if (category.status === "create-pending") {
            await category.update({ status: null });
          } else if (category.status === "delete-pending") {
            await category.destroy();
          }
        } else {
          if (category.status === "create-pending") {
            await category.destroy();
          } else if (category.status === "delete-pending") {
            await category.update({ status: null });
          }
        }
      })
    );

    Log.log("category", ids, "commit", user.id, { action });

    res.send();
  })
);

// router.put(
//   "/commit/entity",
//   access("user"),
//   validate(
//     {
//       query: {
//         action: tester().isIn([...validActionTypes]),
//         target: tester().isIn([...validTargetNames]),
//         targetId: tester().isNumeric(),
//       },
//     },
//     true
//   ),
//   async (req, res, next) => {
//     const { action, target, targetId } = req.query;
//     const { id } = req.params.user;

//     await Commit.create({
//       action,
//       target,
//       targetId,
//       userId: id,
//     });

//     res.send();
//   }
// );

router.put(
  "/commit/phone",
  access("user"),
  validate({
    body: {
      action: tester().isIn(["approve", "decline"]).required(),
      ids: tester().array({}),
    },
  }),
  transactionHandler(async (req, res, next) => {
    const { ids, action } = req.body;
    const { params } = req;

    const phones = await Phone.unscoped().findAll({
      where: { id: { [Op.in]: ids } },
    });

    const { user } = params;

    await Promise.all(
      phones.map(async (phone) => {
        switch (action) {
          case "approve":
            if (user.role === "user")
              throw new ApiError(errorType.ACCESS_DENIED);
            if (phone.status === "create-pending") {
              await Phone.unscoped().update(
                { status: null, statusId: null },
                { where: { id: phone.id } }
              );
            } else if (phone.status === "delete-pending")
              await Phone.unscoped().destroy({ where: { id: phone.id } });
            break;

          case "decline":
            if (user.role === "user" && phone.statusId !== user.id)
              throw new ApiError(errorType.ACCESS_DENIED, {
                description: "Вы не являетесь автором данного средства связи.",
              });
            if (phone.status === "create-pending")
              await Phone.unscoped().destroy({
                where: { id: phone.id },
              });
            else if (phone.status === "delete-pending")
              await Phone.unscoped().update(
                { status: null },
                { where: { id: phone.id } }
              );
            break;
        }
      })
    );

    Log.log(
      "phone",
      phones.map((phone) => phone.id),
      "commit",
      user.id,
      { action }
    );

    res.send();
  })
);

router.delete(
  "/commit",
  access("user"),
  validate({
    query: {
      keys: tester(),
      targetId: tester().required(),
      target: tester().required(),
      userId: tester().isNumber(),
    },
  }),
  // owner("phone", (r) => r.query.targetId),
  convertValues({ keys: (c) => c.toArray().value }),
  transactionHandler(async (req, res) => {
    const { id, role } = req.params.user;
    const { target, targetId, keys, userId } = req.query;

    if (role === "user" && userId && userId !== id)
      throw new ApiError(errorType.ACCESS_DENIED, {
        description:
          "Отменить изменение невозможно т.к. вы не являетесь его автором.",
      });

    const targetUserId = userId ?? id;

    const updater = getUpdater(target, targetId, targetUserId);
    if (!Array.isArray(keys)) await updater.clear();
    else await updater.clear(...keys);

    Log.log(target, [targetId], "commit", id, { target, targetId, keys });

    res.send();
  })
);

export default router;
