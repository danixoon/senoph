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

const router = AppRouter();

router.get(
  "/holder",
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

export default router;
