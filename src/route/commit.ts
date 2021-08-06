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
import { prepareItems } from "../utils";
import Phone from "@backend/db/models/phone.model";
import { ApiError, errorType } from "@backend/utils/errors";

const router = AppRouter();

router.get(
  "/commit",
  access("user"),
  validate({ query: { target: tester().required() } }),
  async (req, res) => {
    const { id } = req.params.user;
    const { target } = req.query;
    const changes = await getChanges(id, target);
    res.send(changes);
  }
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
  async (req, res) => {
    const { id } = req.params.user;
    const { target, targetId } = req.query;
    const changes = req.body;

    const updater = getUpdater(target, targetId, id);
    await updater.push(changes);

    res.send();
  }
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
    query: {
      action: tester().isIn(["approve", "decline"]).required(),
      id: tester().isNumeric().required(),
    },
  }),
  owner(
    "phone",
    (req) => req.query.id,
    (model) => {
      if (model.status === null)
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "Объект изменений не ожидает",
        });
    }
  ),
  async (req, res, next) => {
    const { id, action } = req.query;
    const { params } = req;

    if (!withOwner(params, "phone") || !withUser(params))
      return next(new ApiError(errorType.INTERNAL_ERROR));

    const { phone } = params;

    switch (action) {
      case "approve":
        if (phone.status === "create-pending")
          await Phone.update({ status: null }, { where: { id } });
        else if (phone.status === "delete-pending")
          await Phone.destroy({ where: { id } });
        break;

      case "decline":
        if (phone.status === "create-pending")
          await Phone.destroy({ where: { id } });
        else if (phone.status === "delete-pending")
          await Phone.update({ status: null }, { where: { id } });
        break;
    }
  }
);

router.delete(
  "/commit",
  access("user"),
  validate({
    query: {
      keys: tester().required(),
      targetId: tester().required(),
      target: tester().required(),
    },
  }),
  owner("phone", (r) => r.query.targetId),
  convertValues({ keys: (c) => c.toArray().value }),
  async (req, res) => {
    const { id } = req.params.user;
    const { target, targetId, keys } = req.query;

    const updater = getUpdater(target, targetId, id);
    await updater.clear(...keys);

    res.send();
  }
);

export default router;
