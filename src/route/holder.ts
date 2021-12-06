import { getChanges, getUpdater } from "@backend/db/commit";
import { access } from "@backend/middleware/auth";
import { convertValues } from "@backend/middleware/converter";
import { tester, validate } from "@backend/middleware/validator";
import { Router } from "express";
import { AppRouter } from "../router";

import Model from "../db/models/phoneModel.model";
import { Filter } from "@backend/utils/db";
import { ForeignKeyConstraintError, Op } from "sequelize";
import Holder from "@backend/db/models/holder.model";
import { transactionHandler, prepareItems } from "../utils";
import Log from "@backend/db/models/log.model";
import { ApiError, errorType } from "@backend/utils/errors";

const router = AppRouter();

router.get(
  "/holders",
  access("user"),
  validate({
    query: {
      id: tester().isNumeric(),
      name: tester(),
    },
  }),
  transactionHandler(async (req, res, next) => {
    const { name } = req.query;
    const filter = new Filter(req.query);

    // const search = [firstName, lastName, middleName].filter((v) => v).join(" ");

    filter
      .or((f) =>
        f
          .addWith("firstName", name, Op.substring)
          .addWith("lastName", name, Op.substring)
          .addWith("middleName", name, Op.substring)
      )

      .add("id");

    const holders = await Holder.findAndCountAll({
      where: filter.where,
    });

    // console.log(filter.where);

    res.send(
      prepareItems(holders.rows as Api.Models.Holder[], holders.count, 0)
    );
  })
);

router.put(
  "/holder",
  access("admin"),
  validate({
    query: {
      id: tester().isNumber().required(),
      firstName: tester(),
      lastName: tester(),
      middleName: tester(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.params.user;
    const { id: targetId, ...rest } = req.query;

    const holder = await Holder.findByPk(targetId);
    if (!holder)
      throw new ApiError(errorType.NOT_FOUND, {
        description: `Владелец #${targetId} не найден.`,
      });

    const prevHolder = holder.toJSON();

    const updatedHolder = await holder?.update({ ...rest });

    Log.log("holder", [targetId], "edit", id, {
      before: prevHolder,
      after: holder,
      query: req.query,
    });

    res.send({ id: targetId });
  })
);

router.post(
  "/holder",
  access("admin"),
  validate({
    query: {
      firstName: tester().required(),
      lastName: tester().required(),
      middleName: tester().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { firstName, lastName, middleName } = req.query;

    const holder = await Holder.create({
      firstName,
      lastName,
      middleName,
    });

    Log.log("holder", [holder.id], "create", user.id);

    res.send({ id: holder.id });
  })
);

router.delete(
  "/holder",
  access("admin"),
  validate({
    query: {
      id: tester().required().isNumber(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    try {
      const holder = await Holder.destroy({ where: { id } });
      Log.log("holder", [id], "delete", user.id);
    } catch (err) {
      if (err instanceof ForeignKeyConstraintError) {
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description: "Невозможно удаление владельца участвующего в движениях",
        });
      }
    }
    res.send();
  })
);

export default router;
