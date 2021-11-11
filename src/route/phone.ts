import { Router } from "express";

import Phone from "../db/models/phone.model";
import Model from "../db/models/phoneModel.model";
import { handler, prepareItems } from "@backend/utils/index";
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
import { access, owner, withOwner } from "@backend/middleware/auth";
import { tester, validate } from "@backend/middleware/validator";
import { Filter } from "@backend/utils/db";
import Holding from "@backend/db/models/holding.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import PhoneType from "@backend/db/models/phoneType.model";
import PhoneModelDetail from "@backend/db/models/phoneModelDetail.model";
import Log from "@backend/db/models/log.model";

const router = AppRouter();

router.delete(
  "/phone",
  access("user"),
  validate({ query: { id: tester() } }),
  owner("phone", (q) => q.query.id),
  handler(async (req, res) => {
    const { params } = req;
    if (!withOwner(params, "phone")) return res.sendStatus(500);

    const { phone } = params;
    await Phone.update(
      { status: "delete-pending" },
      { where: { id: phone[0].id } }
    );

    res.send();
  })
);

router.get(
  "/phone/byId",
  access("user"),
  validate({ query: { id: tester().required().isNumber() } }),
  handler(async (req, res) => {
    const { id } = req.query;
    const phone = await Phone.findByPk(id, {
      include: [
        PhoneModel,
        PhoneCategory,
        { model: Holding, include: [Holder] },
      ],
    });

    // TODO: Сделать проверку на статус правильной
    if (phone != null && phone.status === null) {
      const withHolder = await Phone.withHolders([phone]);
      res.send(withHolder[0]);
    } else res.sendStatus(404);
  })
);

router.get(
  "/phone/holdings",
  access("user"),
  validate({
    query: {
      // status: tester(),
      // ids: tester().array("int"),
      phoneIds: tester().array("int"),
      // latest: tester().isBoolean(),
    },
  }),
  handler(async (req, res) => {
    // const { latest, phoneIds } = req.query;

    // const filter = new Filter(req.query).add("status");
    const filter = new Filter({ id: req.query.phoneIds }).add("id", Op.in);

    const holdings = await Holding.findAll({
      include: [
        {
          model: Phone,
          where: filter.where,
          attributes: ["id"],
          // required: (req.query.phoneIds ?? []).length > 0,
        },
        Holder,
      ],
      // where: filter.where,
    });

    res.send(
      prepareItems(
        holdings.map((holding) => ({
          id: holding.id,
          holderId: holding.holderId,
          phoneIds: holding.phones?.map((phone) => phone.id) ?? [],
          reasonId: holding.reasonId,
          orderDate: holding.orderDate,
          orderUrl: holding.orderUrl,
          holder: holding.holder,
        })),
        holdings.length,
        0
      )
    );
  })
);

router.get(
  "/phone/commit",
  access("user"),
  validate({
    query: { status: tester().isIn(["delete-pending", "create-pending"]) },
  }),
  handler(async (req, res, next) => {
    const { status } = req.query;

    const filter = new Filter(req.query);
    filter.add("status");

    const phones = await Phone.withHolders(
      await Phone.scope("commit").findAll({ where: filter.where })
    );

    res.send(prepareItems(phones, phones.length, 0));
  })
);

router.get(
  "/phone",
  access("user"),
  validate({
    query: {
      ids: tester().array("int"),
      exceptIds: tester().array("int"),
      amount: tester().isNumber(),
      factoryKey: tester(),
      category: tester(),
      departmentId: tester(),
      inventoryKey: tester(),
      offset: tester().isNumber(),
      phoneModelId: tester().isNumber(),
      phoneTypeId: tester().isNumber(),
      search: tester(),
      sortDir: tester().isIn(["asc", "desc"]),
      sortKey: tester(),
    },
  }),

  handler(async (req, res) => {
    const {
      search,
      sortDir: orderDir,
      sortKey: orderKey,
      amount = 50,
      offset = 0,
      category: categoryKey,
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

    const include = [
      // {
      // model: Holding,
      // include: [Holder], // where: {
      // departmentId: valueOrNotNull(departmentId),
      // },
      // },
    ] as any;
    // ] as any;

    // if (phoneTypeId !== undefined || search !== undefined)
    include.push({
      model: PhoneModel,
      where: new Filter({ phoneTypeId, search })
        .add("phoneTypeId")
        .add("search", Op.substring).where,
      //  {
      //   phoneTypeId: valueOrNotNull(phoneTypeId),
      //   name: search ? { [Op.substring]: search } : { [Op.not]: null },
      // },
      // required: phoneTypeId !== undefined || search !== undefined,
    });

    if (departmentId !== undefined)
      include.push({
        model: Department,
        where: new Filter({ id: departmentId }).add("id").where,
      });

    if (categoryKey !== undefined)
      include.push({
        model: PhoneCategory,
        where: new Filter({ categoryKey }).add("categoryKey").where, // { category: valueOrNotNull(category?.toString()) },
      });

    const filter = new Filter({
      id: whereId,
      phoneModelId,
      inventoryKey,
      factoryKey,
    });

    filter.add("id");
    filter.add("phoneModelId");
    filter.add("inventoryKey", Op.substring);
    filter.add("factoryKey", Op.substring);

    const phones = await Phone.findAll({
      where: filter.where,
      include,
      order,
    }).catch((err) => console.error(err));

    // TODO: Неоптимизированный костыль, но что поделать
    const rows = await Phone.withHolders(
      (phones ?? []).slice(offset_, offset_ + limit_)
    );

    if (phones) res.send(prepareItems(rows, phones.length, offset_));
    else
      throw new ApiError(errorType.INTERNAL_ERROR, {
        description: "Ошибка поиска",
      });
  })
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
  handler(async (req, res, next) => {
    const { body, params } = req;
    const { user } = params;

    try {
      const phone = await Phone.create({ ...body.data[0], authorId: user.id });

      // TODO: Сделать логгирование более строгим (через хуки?)
      Log.log("phone", [phone.id], "create", user.id);

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
  })
);

router.get(
  "/phone/models",
  access("user"),
  validate({ query: { ids: tester().array("int"), name: tester() } }),
  handler(async (req, res) => {
    const { name } = req.query;

    const filter = new Filter({ name });
    filter.add("name", Op.like);

    const models = await PhoneModel.findAll({
      where: filter.where,
      include: [PhoneModelDetail],
    });

    res.send(prepareItems(models as Api.Models.PhoneModel[], models.length, 0));
  })
);

router.post(
  "/phone/model",
  access("admin"),
  validate({
    body: {
      accountingDate: tester().required().isDate(),
      phoneTypeId: tester().required().isNumber(),
      name: tester().required(),
      details: tester().array({
        name: tester().required(),
        units: tester().required(),
        amount: tester().required().isNumber(),
        // modelId: tester().required().isNumber(),
        type: tester().required().isIn(["preciousMetal"]),
      }),
      description: tester(),
    },
  }),
  handler(async (req, res) => {
    const { user } = req.params;
    const { accountingDate, phoneTypeId, name, details, description } =
      req.body;

    const model = await PhoneModel.create({
      accountingDate: accountingDate.toISOString(),
      phoneTypeId,
      name,
      description,
    });

    Log.log("model", [model.id], "create", user.id);

    if (details) {
      await PhoneModelDetail.bulkCreate(
        details.map((detail) => ({
          name: detail.name,
          amount: detail.amount,
          type: detail.type,
          units: detail.units,
          modelId: model.id,
        }))
      );
    }

    res.send({ id: model.id });
  })
);

router.delete(
  "/phone/model",
  access("admin"),
  validate({
    query: {
      id: tester().required().isNumber(),
    },
  }),
  handler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    const model = await PhoneModel.destroy({ where: { id } });
    Log.log("model", [id], "delete", user.id);

    res.send();
  })
);

router.get(
  "/phone/types",
  access("user"),
  validate({
    query: {
      ids: tester().array("int"),
    },
  }),
  handler(async (req, res) => {
    const filter = new Filter({ id: req.query.ids }).add("id", Op.in);
    const phoneTypes = await PhoneType.findAll({
      where: filter.where,
    });

    res.send(
      prepareItems(
        phoneTypes.map((type) => type as Api.Models.PhoneType),
        phoneTypes.length,
        0
      )
    );
  })
);

router.post(
  "/phone/type",
  access("admin"),
  validate({
    query: {
      description: tester(),
      name: tester().required(),
    },
  }),
  handler(async (req, res) => {
    const { user } = req.params;
    const { description, name } = req.query;

    const type = await PhoneType.create({ name, description });
    Log.log("phoneType", [type.id], "create", user.id);

    res.send({ id: type.id });
  })
);

router.delete(
  "/phone/type",
  access("admin"),
  validate({
    query: {
      id: tester().required().isNumber(),
    },
  }),
  handler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    const phoneType = await PhoneType.destroy({ where: { id } });
    Log.log("phoneType", [id], "delete", user.id);

    res.send();
  })
);

export default router;
