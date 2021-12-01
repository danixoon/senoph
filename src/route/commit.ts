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
import { Filter } from "@backend/utils/db";
import { Op } from "sequelize";
import { getModel } from "../db";
import { transactionHandler, prepareItems } from "../utils";
import Phone from "@backend/db/models/phone.model";
import { ApiError, errorType } from "@backend/utils/errors";
import Holding from "@backend/db/models/holding.model";
import PhoneCategory from "@backend/db/models/phoneCategory.model";
import Log from "@backend/db/models/log.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";

const router = AppRouter();

router.get(
  "/commit",
  access("user"),
  validate({ query: { target: tester().required() } }),
  async (req, res) => {
    const { id } = req.params.user;
    const { target } = req.query;
    const changes = Object.entries(await getChanges(id, target)).reduce(
      (acc, [key, value]) => [...acc, { id: Number(key), ...value }],
      [] as any[]
    );

    res.send(prepareItems(changes, changes.length, 0));
  }
);

// ???
router.put(
  "/commit",
  access("user"),
  validate({
    query: {
      target: tester().required(),
      targetId: tester().isNumber().required(),
    },
  }),
  // TODO: Сделать проверку на владельца изменений
  transactionHandler(async (req, res, next) => {
    const { target, targetId } = req.query;
    const { id } = req.params.user;

    const updater = getUpdater(target, targetId, id);
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

router.post(
  "/commit",
  access("user"),
  validate({
    query: { target: tester().required(), targetId: tester().required() },
  }),
  owner("phone", (r) => r.query.targetId),
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
          if (holding.status === "create-pending") {
            await holding.update({ status: null });
          } else if (holding.status === "delete-pending") {
            await holding.destroy();
          }
        } else {
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
          if (holdingPhone.status === "create-pending") {
            await holdingPhone.update({
              status: null,
              statusAt: new Date().toISOString(),
            });
          } else if (holdingPhone.status === "delete-pending") {
            await holdingPhone.destroy();
          }
        } else {
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
  "/commit/category",
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
    if (action === "approve")
      await PhoneCategory.unscoped().update(
        { status: null },
        { where: { phoneId: { [Op.in]: ids }, status: "create-pending" } }
      );
    else
      await PhoneCategory.unscoped().destroy({
        where: { phoneId: { [Op.in]: ids }, status: "create-pending" },
      });

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
  owner(
    "phone",
    (req) => req.body.ids,
    (model) => {
      if (model.status === null)
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "Объект изменений не ожидает",
        });
    }
  ),
  transactionHandler(async (req, res, next) => {
    const { ids, action } = req.body;
    const { params } = req;

    if (!withOwner(params, "phone") || !withUser(params))
      return next(new ApiError(errorType.INTERNAL_ERROR));

    const { phone: phones, user } = params;

    await Promise.all(
      phones.map(async (phone) => {
        switch (action) {
          case "approve":
            if (phone.status === "create-pending")
              await Phone.unscoped().update(
                { status: null },
                { where: { id: phone.id } }
              );
            else if (phone.status === "delete-pending")
              await Phone.unscoped().destroy({ where: { id: phone.id } });
            break;

          case "decline":
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
    },
  }),
  owner("phone", (r) => r.query.targetId),
  convertValues({ keys: (c) => c.toArray().value }),
  transactionHandler(async (req, res) => {
    const { id } = req.params.user;
    const { target, targetId, keys } = req.query;

    const updater = getUpdater(target, targetId, id);
    if (!Array.isArray(keys)) await updater.clearAll();
    else await updater.clear(...keys);

    res.send();
  })
);

export default router;
