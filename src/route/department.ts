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
import PhoneCategory from "@backend/db/models/phoneCategory.model";
import Log from "@backend/db/models/log.model";

const router = AppRouter();

router.get(
  "/departments",
  access("user"),
  validate({
    query: {
      ids: tester().array("int"),
    },
  }),
  transactionHandler(async (req, res) => {
    const filter = new Filter({ id: req.query.ids }).add("id", Op.in);
    const departments = await Department.findAll({
      where: filter.where,
    });

    res.send(
      prepareItems(
        departments.map((department) => department as Api.Models.Department),
        departments.length,
        0
      )
    );
  })
);

router.post(
  "/department",
  access("admin"),
  validate({
    query: {
      description: tester(),
      name: tester().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { description, name } = req.query;

    const department = await Department.create({ name, description });
    Log.log("department", [department.id], "create", user.id);

    res.send({ id: department.id });
  })
);

router.delete(
  "/department",
  access("admin"),
  validate({
    query: {
      id: tester().required().isNumber(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    const department = await Department.destroy({ where: { id } });

    Log.log("department", [id], "delete", user.id);

    res.send();
  })
);

export default router;
