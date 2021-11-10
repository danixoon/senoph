import { Router } from "express";

import Phone from "../db/models/phone.model";
import Model from "../db/models/phoneModel.model";
import { handler, prepareItems } from "@backend/utils/index";
import PhoneModel from "../db/models/phoneModel.model";
import Holder from "@backend/db/models/holder.model";
import { Op, Order, OrderItem, WhereOperators } from "sequelize";
import PhoneCategory from "@backend/db/models/phoneCategory.model";
import Department from "@backend/db/models/department.model";
import { convertValues } from "@backend/middleware/converter";
import { AppRouter } from "../router";
import { ApiError, errorType } from "../utils/errors";
import { access } from "@backend/middleware/auth";
import { tester, validate } from "@backend/middleware/validator";
import PhoneModelDetail from "@backend/db/models/phoneModelDetail.model";

const router = AppRouter();



// router.post(
//   "/model",
//   access("user"),
//   validate({ query: { id: tester().isNumeric(), name: tester() } }),
//   async (req, res, next) => {
//     const { name } = req.query;

//     const where: any = name ? { name: { [Op.like]: name } } : undefined;
//     const models = await PhoneModel.findAll({ where });

//     res.send(prepareItems(models as Api.Models.PhoneModel[], models.length, 0));
//   }
// );

export default router;
