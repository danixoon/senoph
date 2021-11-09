import { getChanges, getUpdater } from "@backend/db/commit";
import { access } from "@backend/middleware/auth";
import { convertValues } from "@backend/middleware/converter";
import { tester, validate } from "@backend/middleware/validator";
import { Router } from "express";
import { AppRouter } from "../router";

import Model from "../db/models/phoneModel.model";
import { Filter } from "@backend/utils/db";
import { Op } from "sequelize";
import Holder from "@backend/db/models/holder.model";
import { handler, prepareItems } from "../utils";
import Log from "@backend/db/models/log.model";

const router = AppRouter();

router.get(
  "/holders",
  access("user"),
  validate({
    query: {
      id: tester().isNumeric(),
      name: tester(),
      departmentId: tester().isNumeric(),
    },
  }),
  handler(async (req, res, next) => {
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
      .add("departmentId")
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

router.post(
  "/holder",
  access("admin"),
  validate({
    query: {
      firstName: tester().required(),
      lastName: tester().required(),
      middleName: tester().required(),
      departmentId: tester().required().isNumber(),
    },
  }),
  handler(async (req, res) => {
    const { user } = req.params;
    const { firstName, lastName, middleName, departmentId } = req.query;

    const holder = await Holder.create({
      firstName,
      lastName,
      middleName,
      departmentId,
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
  handler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    const holder = await Holder.destroy({ where: { id } });

    Log.log("holder", [id], "delete", user.id);

    res.send();
  })
);

export default router;
