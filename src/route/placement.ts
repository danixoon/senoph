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
import Placement from "@backend/db/models/placement.model";

const router = AppRouter();

router.get(
  "/placements",
  access("user"),
  validate({
    query: {
      ids: tester().array("int"),
    },
  }),
  transactionHandler(async (req, res) => {
    const filter = new Filter({ id: req.query.ids }).add("id", Op.in);
    const placements = await Placement.findAll({
      where: filter.where,
    });

    res.send(
      prepareItems(
        placements.map((placement) => placement as Api.Models.Placement),
        placements.length,
        0
      )
    );
  })
);

router.post(
  "/placement",
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

    const placement = await Placement.create({ name, description });
    Log.log("placement", [placement.id], "create", user.id);

    res.send({ id: placement.id });
  })
);

router.delete(
  "/placement",
  access("admin"),
  validate({
    query: {
      id: tester().required().isNumber(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    const placement = await Placement.destroy({ where: { id } });

    Log.log("placement", [id], "delete", user.id);

    res.send();
  })
);

export default router;
