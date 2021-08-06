import { Router } from "express";

import Phone from "../db/models/phone.model";
import Model from "../db/models/phoneModel.model";
import { prepareItems } from "@backend/utils/index";
import PhoneModel from "../db/models/phoneModel.model";
import Holder from "@backend/db/models/holder.model";
import {
  Op,
  Order,
  OrderItem,
  UniqueConstraintError,
  WhereOperators,
} from "sequelize";
import PhoneCategory from "@backend/db/models/phoneCategory.model";
import Department from "@backend/db/models/department.model";
import { convertValues } from "@backend/middleware/converter";
import { AppRouter } from "../router";
import { ApiError, errorType } from "../utils/errors";
import { access } from "@backend/middleware/auth";
import { tester, validate } from "@backend/middleware/validator";

const router = AppRouter();

router.get("/phone/byId", async (req, res) => {
  const { id } = req.query;
  const phone = (await Phone.findByPk(id, {
    include: [{ all: true }],
  })) as Api.Models.Phone;

  if (phone != null) res.send(phone);
  else res.sendStatus(404);
});

router.get(
  "/phone",
  access("user"),
  // validate({ query: { ids: tester(), } }),
  convertValues({
    ids: (c) => c.toArray().toNumbers(false).value,
    exceptIds: (c) => c.toArray().toNumbers(false).value,
  }),
  async (req, res) => {
    const {
      search,
      sortDir: orderDir,
      sortKey: orderKey,
      amount = 50,
      offset = 0,
      category,
      phoneModelId,
      departmentId,
      phoneTypeId,
      factoryKey,
      inventoryKey,
      ids,
      exceptIds,
    } = req.query;

    const order = [] as OrderItem[];
    const dir = orderDir?.toUpperCase() ?? "ASC";

    switch (orderKey) {
      case "modelName":
        order.push([{ model: PhoneModel, as: "model" }, "name", dir]);
        break;
      case "category":
        order.push([{ model: PhoneCategory, as: "category" }, "category", dir]);
        break;
      case "department":
        order.push([
          { model: Holder, as: "holder" },
          { model: Department, as: "department" },
          "name",
          dir,
        ]);
        break;
      default:
        if (typeof orderKey === "string") order.push([orderKey, dir]);
        break;
    }

    const offset_ = Number.parseInt(offset.toString()),
      limit_ = Number.parseInt(amount.toString());

    const valueOrNotNull = <T>(v: T) => v ?? { [Op.not]: null };

    // TODO: Использовать объект позоляющий удобно опиционально фильтровать
    const whereId = { [Op.notIn]: exceptIds ?? [] } as WhereOperators;
    if ((ids?.length ?? 0) > 0) whereId[Op.in] = ids;

    const phones = await Phone.findAll({
      where: {
        id: whereId,
        phoneModelId: valueOrNotNull(phoneModelId),
        inventoryKey: valueOrNotNull(inventoryKey),
        factoryKey: valueOrNotNull(factoryKey),
      },
      include: [
        {
          model: PhoneModel,
          where: {
            phoneTypeId: valueOrNotNull(phoneTypeId),
            name: search ? { [Op.substring]: search } : { [Op.not]: null },
          },
          required: phoneTypeId !== undefined || search !== undefined,
        },
        {
          model: Holder,
          where: {
            departmentId: valueOrNotNull(departmentId),
          },
          include: [
            {
              model: Department,
              required: departmentId !== undefined,
            },
          ],
        },
        {
          model: PhoneCategory,
          where: { category: valueOrNotNull(category?.toString()) },
          required: category !== undefined,
        },
      ],
      order,
      // TODO: Избавиться от преобразований данных путём валидаторов в express
      // offset: offset_,
      // limit: limit_,
      // subQuery: false,
      // distinct: true
    }).catch((err) => console.error(err));

    // TODO: Неоптимизированный костыль, но что поделать
    const rows = (phones ?? []).slice(
      offset_,
      offset_ + limit_
    ) as Api.Models.Phone[];

    if (phones) res.send(prepareItems(rows, phones.length, offset_));
    else
      throw new ApiError(errorType.INTERNAL_ERROR, {
        description: "Ошибка поиска",
      });
  }
);

router.post(
  "/phone",
  access("user"),
  validate({
    body: {
      data: tester().array({
        assemblyDate: tester().isISO8601().required(),
        accountingDate: tester().isISO8601().required(),
        commissioningDate: tester().isISO8601().required(),

        factoryKey: tester().required(),
        inventoryKey: tester().required(),

        holderId: tester().isNumber().required(),
        phoneModelId: tester().isNumber().required(),
      }),
    },
  }),
  async (req, res, next) => {
    const { body, params } = req;
    const { user } = params;

    try {
      const phone = await Phone.create({ ...body.data[0], authorId: user.id });

      res.send(phone);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return next(
          new ApiError("INVALID_BODY", {
            description: "Проверьте уникальность полей",
          })
        );
      }
    }
  }
);

export default router;
