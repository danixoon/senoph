import { query, Router } from "express";

// import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone.model";
import model from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import Department from "@backend/db/models/department.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { AppRouter } from "../router";
import { handler, prepareItems } from "../utils";
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

const router = AppRouter();

router.get(
  "/categories",
  access("user"),
  validate({
    query: {
      status: tester(),
      ids: tester().array("int"),
    },
  }),
  handler(async (req, res) => {
    const filter = new Filter(req.query).add("status");
    const categories = await PhoneCategory.findAll({
      // include: [
      //   {
      //     model: Phone,
      //     attributes: ["id"],
      //   },
      //   Holder,
      // ],
      where: filter.where,
    });

    res.send(
      prepareItems(
        categories.map((category) => ({
          id: category.id,
          actDate: new Date(category.actDate),
          actUrl: category.actUrl,
          categoryKey: category.categoryKey,
          phoneId: category.phoneId,
        })),
        categories.length,
        0
      )
    );
  })
);

router.post(
  "/category",
  access("user"),
  upload(".pdf").single("actFile"),
  validate({
    body: {
      description: tester(),
      categoryKey: tester().required(),
      phoneIds: tester().array("int").required(),
      actFile: tester(),
      actDate: tester().isDate().required(),
    },
  }),
  owner("phone", (req) => req.body.phoneIds),
  handler(async (req, res) => {
    // TODO: Make file validation
    const { file } = req;
    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл акта обязателен",
      });

    const { categoryKey, actDate, phoneIds, description } = req.body;

    const categories = await PhoneCategory.bulkCreate(
      phoneIds.map((phoneId) => ({
        phoneId,
        actUrl: file.path,
        description,
        categoryKey,
        actDate
      }))
    );

    // TODO: Make holding create validation
    res.send();
  })
);

export default router;
