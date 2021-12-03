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
import { Filter, WhereFilter } from "@backend/utils/db";
import Phone from "@backend/db/models/phone.model";
import Category from "@backend/db/models/category.model";
import category from "@backend/db/queries/category";

const router = AppRouter();

router.get(
  "/categories",
  access("user"),
  validate({
    query: {
      status: tester(),
      ids: tester().array("int"),
      orderDate: tester().isDate(),
      orderKey: tester().isDate(),
    },
  }),
  transactionHandler(async (req, res) => {
    // const filter = new Filter(req.query).add("status");
    const { ids, status, orderDate, orderKey } = req.query;
    const filter = new WhereFilter<DB.CategoryAttributes>();

    filter.on("id").optional(Op.in, ids);
    filter.on("status").optional(Op.eq, status);

    const categories = await Category.findAll({
      include: [
        {
          model: Phone,
          attributes: ["id"],
        },
      ],
      where: filter.where,
    });

    res.send(
      prepareItems(
        categories.map((category) => ({
          id: category.id,
          actKey: category.actKey,
          actDate: category.actDate,
          actUrl: category.actUrl,
          categoryKey: category.categoryKey,
          phoneIds: category.phones?.map((v) => v.id) ?? [],
          status: category.status,
          statusAt: category.statusAt,
          authorId: category.authorId,
          createdAt: category.createdAt,
          // updatedAt: category.updated
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
      categoryKey: tester().isIn(["1", "2", "3", "4"]).required(),
      phoneIds: tester().array("int").required(),
      actFile: tester(),
      actDate: tester().isDate().required(),
      actKey: tester().required(),
    },
  }),
  owner("phone", (req) => req.body.phoneIds),
  transactionHandler(async (req, res) => {
    // TODO: Make file validation
    const { file } = req;
    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл акта обязателен",
      });

    const { user } = req.params;
    const { categoryKey, actDate, phoneIds, actKey, description } = req.body;

    const cat = await category.create(user.id, {
      actDate,
      phoneIds,
      actKey,
      actUrl: file.filename,
      categoryKey,
    });

    // TODO: Make holding create validation
    res.send({ id: cat.id });
  })
);

router.delete(
  "/category",
  access("user"),
  validate({
    query: { id: tester().isNumber() },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.query;
    await Category.update({ status: "delete-pending" }, { where: { id } });

    res.send();
  })
);

export default router;
