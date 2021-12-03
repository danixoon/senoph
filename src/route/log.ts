import { query, Router } from "express";

// import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone.model";
import model from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import Department from "@backend/db/models/department.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { AppRouter } from "../router";
import { transactionHandler, prepareItems } from "../utils";
import { access, owner } from "@backend/middleware/auth";
import { tester, validate } from "@backend/middleware/validator";
import { upload } from "@backend/middleware/upload";
import { ApiError, errorType } from "@backend/utils/errors";
import Holding from "@backend/db/models/holding.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import { convertValues } from "@backend/middleware/converter";
import Holder from "@backend/db/models/holder.model";
import { Op } from "sequelize";
import { Filter } from "@backend/utils/db";
import Phone from "@backend/db/models/phone.model";
import Category from "@backend/db/models/category.model";
import Log from "@backend/db/models/log.model";
import LogTarget from "@backend/db/models/logTarget.model";

const router = AppRouter();

router.get(
  "/logs",
  access("admin"),
  validate({
    query: {},
  }),
  transactionHandler(async (req, res) => {
    const filter = new Filter({}); //.add("id", Op.in);
    const logs = await Log.findAll({
      where: filter.where,
      include: [LogTarget],
    });

    res.send(
      prepareItems(
        logs.map((log) => log as Api.Models.Log),
        logs.length,
        0
      )
    );
  })
);

export default router;
