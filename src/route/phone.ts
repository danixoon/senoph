import { Router } from "express";
import { ForeignKeyConstraintError, ModelStatic } from "sequelize";
import Phone from "../db/models/phone.model";
import Model from "../db/models/phoneModel.model";
import { transactionHandler, prepareItems } from "@backend/utils/index";
import PhoneModel from "../db/models/phoneModel.model";
import Holder from "@backend/db/models/holder.model";
import {
  Op,
  Order,
  OrderItem,
  UniqueConstraintError,
  WhereOperators,
} from "sequelize";
import Category from "@backend/db/models/category.model";
import Department from "@backend/db/models/department.model";
import { convertValues } from "@backend/middleware/converter";
import { AppRouter } from "../router";
import { ApiError, errorMap, errorType } from "../utils/errors";
import { access, owner, withOwner } from "@backend/middleware/auth";
import { tester, validate } from "@backend/middleware/validator";
import { Filter, WhereField, WhereFilter } from "@backend/utils/db";
import Holding from "@backend/db/models/holding.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import PhoneType from "@backend/db/models/phoneType.model";
import PhoneModelDetail from "@backend/db/models/phoneModelDetail.model";
import Log from "@backend/db/models/log.model";
import phone from "@backend/db/queries/phone";
import { sequelize } from "../db";
import { Sequelize } from "sequelize";

const router = AppRouter();

router.delete(
  "/phone",
  access("user"),
  validate({ query: { ids: tester().array("int").required() } }),
  owner("phone", (q) => q.query.ids),
  transactionHandler(async (req, res) => {
    const { params } = req;
    if (!withOwner(params, "phone")) return res.sendStatus(500);

    const { phone } = params;
    // TODO: Сделать назначение статуса единоместным
    await Phone.update(
      { status: "delete-pending", statusAt: new Date().toISOString() },
      { where: { id: { [Op.in]: phone.map((phone) => phone.id) } } }
    );

    res.send();
  })
);

router.get(
  "/phone/byId",
  access("user"),
  validate({ query: { id: tester().required().isNumber() } }),
  transactionHandler(async (req, res) => {
    const { id } = req.query;
    const phone = await Phone.unscoped().findByPk(id, {
      include: [PhoneModel, Category, { model: Holding, include: [Holder] }],
      order: [[Sequelize.literal("`holdings.orderDate`"), "ASC"]],
    });

    // TODO: Сделать проверку на статус правильной
    // if (phone != null) {
    //   const withHolder = await Phone.withHolders([phone]);
    if (phone) res.send(phone as Api.Models.Phone);
    else res.sendStatus(404);
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
      orderDate: tester().isDate(),
      orderKey: tester(),
      // latest: tester().isBoolean(),
    },
  }),
  transactionHandler(async (req, res) => {
    // const { latest, phoneIds } = req.query;
    const { phoneIds, orderDate, orderKey } = req.query;
    const { user } = req.params;

    // const filter = new Filter(req.query).add("status");
    const filter = new Filter({ id: phoneIds }).add("id", Op.in);
    const holdingFilter = new Filter({ orderKey, orderDate })
      .add("orderKey", Op.substring)
      .add("orderDate");
    // .add("orderKey", Op.substring)
    // .add("orderDate");

    const holdings = await Holding.findAll({
      include: [
        {
          model: Phone,
          where: filter.where,
          attributes: ["id"],
          required: (req.query.phoneIds ?? []).length > 0,
        },
        Holder,
      ],
      order: [["orderDate", "ASC"]],
      where: holdingFilter.where,
    });

    res.send(
      prepareItems(
        holdings.map((holding) => ({
          id: holding.id,
          holderId: holding.holderId,
          phoneIds: holding.phones?.map((phone) => phone.id) ?? [],
          reasonId: holding.reasonId,
          authorId: user.id,
          departmentId: holding.departmentId,
          orderKey: holding.orderKey,
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
  transactionHandler(async (req, res, next) => {
    const { status } = req.query;

    const filter = new Filter(req.query);
    filter.add("status");

    const phones = await Phone.scope("commit").findAll({ where: filter.where });

    res.send(prepareItems(phones as Api.Models.Phone[], phones.length, 0));
  })
);

const orderByKey = (
  key: string,
  dir: "asc" | "desc",
  map: Record<string, [ModelStatic<any>, string, string] | string>
) => {
  const mapped = map[key];
  if (mapped) {
    if (typeof mapped === "string")
      return [mapped, dir.toUpperCase()] as OrderItem;
    const [model, associationKey, attribute] = mapped;
    return [
      { model, as: associationKey },
      attribute,
      dir.toUpperCase(),
    ] as OrderItem;
  } else return ["id", "DESC"] as OrderItem;
};

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
      departmentId: tester().isNumber(),
      holderId: tester().isNumber(),
      inventoryKey: tester(),
      offset: tester().isNumber(),
      phoneModelId: tester().isNumber(),
      phoneTypeId: tester().isNumber(),
      accountingDate: tester().isDate(),
      comissioningDate: tester().isDate(),
      assemblyDate: tester().isDate(),
      search: tester(),
      sortDir: tester().isIn(["asc", "desc"]),
      sortKey: tester(),
    },
  }),

  transactionHandler(async (req, res) => {
    const {
      search,
      sortDir,
      sortKey,
      amount = 50,
      offset = 0,
      category,
      holderId,
      phoneModelId,
      departmentId,
      phoneTypeId,
      factoryKey,
      inventoryKey,
      accountingDate,
      comissioningDate,
      assemblyDate,
      ids,
      exceptIds,
    } = req.query;

    // const items = await Phone.findAll({
    //   order: [PhoneModel.associations.Task],
    // });

    const order = sortKey
      ? [
          orderByKey(sortKey, sortDir ?? "asc", {
            modelName: [PhoneModel, "model", "name"],
            category: [Category, "category", "category"],
            id: "id",
            inventoryKey: "inventoryKey",
            factoryKey: "factoryKey",
            assemblyDate: "assemblyDate",
            comissioningDate: "comissioningDate",
            accountingDate: "accountingDate",
          }),
        ]
      : [["id", "ASC"] as OrderItem];

    const filter = new WhereFilter<DB.PhoneAttributes>();
    filter.on("id").optional(Op.in, ids).optional(Op.notIn, exceptIds);
    filter.on("factoryKey").optional(Op.substring, factoryKey);
    filter.on("inventoryKey").optional(Op.substring, inventoryKey);
    filter.on("accountingDate").optional(Op.eq, accountingDate);
    // filter
    // .on("assemblyDate")
    // .optional(

    if (assemblyDate?.getFullYear())
      filter.fn(
        Sequelize.where(
          Sequelize.fn("YEAR", Sequelize.col("assemblyDate")),
          assemblyDate.getFullYear().toString()
        )
      );

    // );
    filter.on("commissioningDate").optional(Op.eq, comissioningDate);

    const modelFilter = new WhereFilter<DB.PhoneModelAttributes>();
    modelFilter.on("id").optional(Op.eq, phoneModelId);
    modelFilter.on("phoneTypeId").optional(Op.eq, phoneTypeId);

    // const categoryFilter = new WhereFilter<DB.CategoryAttributes>();
    // categoryFilter.on("categoryKey").optional(Op.eq, category);

    const items = await Phone.findAll({
      order,
      where: filter.where,
      include: [
        // { model: Category, where: categoryFilter.where },
        { model: PhoneModel, where: modelFilter.where },
        { model: Holding },
      ],
      //attributes: ["id"],
    });

    const filteredItems =
      // typeof departmentId === "undefined"
      // ? items
      items.filter((item) => {
        const lastHolding = [...(item.holdings ?? [])].sort((a, b) =>
          a.orderDate > b.orderDate ? 1 : -1
        )[0];

        const isDepartment = typeof departmentId !== "undefined";
        const isHolder = typeof holderId !== "undefined";

        // if (isDepartment && lastHolding?.departmentId !== departmentId)
        // return false;
        // if (isHolder && lastHolding?.holderId !== holderId) return false;

        return (
          (isHolder ? lastHolding?.holderId === holderId : true) &&
          (isDepartment ? lastHolding?.departmentId === departmentId : true)
        );

        // return true;
      });
    const phones = filteredItems.slice(offset, offset + amount);

    // const phones = await Phone.withHolders(ofsetted);

    res.send(
      prepareItems(phones as Api.Models.Phone[], filteredItems.length, offset)
    );

    // const phoneIds = items.map((phone) => phone.id);

    // HoldingPhone.findAll({ include: [{ model: }] })

    // const query = sequelize.query(``);

    const query = `SELECT phone.id FROM `;

    // const order = [] as OrderItem[];
    // const dir = orderDir?.toUpperCase() ?? "ASC";

    // switch (orderKey) {
    //   case "modelName":
    //     order.push([{ model: PhoneModel, as: "model" }, "name", dir]);
    //     break;
    //   case "category":
    //     order.push([{ model: PhoneCategory, as: "category" }, "category", dir]);
    //     break;
    //   case "department":
    //     order.push([
    //       { model: Holder, as: "holder" },
    //       { model: Department, as: "department" },
    //       "name",
    //       dir,
    //     ]);
    //     break;
    //   default:
    //     if (typeof orderKey === "string") order.push([orderKey, dir]);
    //     break;
    // }

    // const offset_ = Number.parseInt(offset.toString()),
    //   limit_ = Number.parseInt(amount.toString());

    // const valueOrNotNull = <T>(v: T) => v ?? { [Op.not]: null };

    // // TODO: Использовать объект позоляющий удобно опиционально фильтровать
    // const whereId = { [Op.notIn]: exceptIds ?? [] } as WhereOperators;
    // if ((ids?.length ?? 0) > 0) whereId[Op.in] = ids;

    // const include = [
    //   // {
    //   // model: Holding,
    //   // include: [Holder], // where: {
    //   // departmentId: valueOrNotNull(departmentId),
    //   // },
    //   // },
    // ] as any;
    // // ] as any;

    // // if (phoneTypeId !== undefined || search !== undefined)
    // include.push({
    //   model: PhoneModel,
    //   where: new Filter({ phoneTypeId, search })
    //     .add("phoneTypeId")
    //     .add("search", Op.substring).where,
    //   //  {
    //   //   phoneTypeId: valueOrNotNull(phoneTypeId),
    //   //   name: search ? { [Op.substring]: search } : { [Op.not]: null },
    //   // },
    //   // required: phoneTypeId !== undefined || search !== undefined,
    // });

    // if (departmentId !== undefined)
    //   include.push({
    //     model: Holding,
    //     order: [[Holding, "orderDate", "ASC"]],
    //     required: true,
    //     include: [
    //       {
    //         model: Holder,
    //         where: { departmentId },
    //         required: true,
    //       },
    //     ],
    //   });

    // if (categoryKey !== undefined)
    //   include.push({
    //     model: PhoneCategory,
    //     where: new Filter({ categoryKey }).add("categoryKey").where, // { category: valueOrNotNull(category?.toString()) },
    //   });

    // const filter = new Filter({
    //   id: whereId,
    //   phoneModelId,
    //   inventoryKey,
    //   factoryKey,
    // });

    // filter.add("id");
    // filter.add("phoneModelId");
    // filter.add("inventoryKey", Op.substring);
    // filter.add("factoryKey", Op.substring);

    // const phones = await Phone.findAll({
    //   where: filter.where,
    //   include,
    //   order,
    // }).catch((err) => console.error(err));

    // // TODO: Неоптимизированный костыль, но что поделать
    // let rows = await Phone.withHolders(phones ?? []);

    // // if(departmentId)
    //   // rows = rows.filter(row => row.holders)

    // const ofsetted = rows.slice(offset_, offset_ + limit_);

    // if (phones) res.send(prepareItems(rows, phones.length, offset_));
    // else
    //   throw new ApiError(errorType.INTERNAL_ERROR, {
    //     description: "Ошибка поиска",
    //   });
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

        factoryKey: tester(),
        inventoryKey: tester(),

        phoneModelId: tester().isNumber().required(),
        randomId: tester(),
      }),
    },
  }),
  transactionHandler(async (req, res, next) => {
    const { body, params } = req;
    const { user } = params;

    try {
      const phones = await phone.create(user.id, body.data);
      const ids = phones.map((p) => p.id as number);

      // TODO: Сделать логгирование более строгим (через хуки?)
      Log.log("phone", ids, "create", user.id);

      res.send({
        created: ids.map((v, i) => ({
          id: v,
          randomId: body.data[i].randomId,
        })),
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError)
        throw new ApiError("INVALID_BODY", {
          description: "Проверьте уникальность полей",
        });
    }
  })
);

router.get(
  "/phone/models",
  access("user"),
  validate({ query: { ids: tester().array("int"), name: tester() } }),
  transactionHandler(async (req, res) => {
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

router.put(
  "/phone/model",
  access("admin"),
  validate({
    query: {
      id: tester().isNumber().required(),
      name: tester(),
      description: tester(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.params.user;
    const { id: targetId, ...rest } = req.query;
    const { details } = req.body;

    const type = await PhoneModel.findByPk(targetId);
    if (!type)
      throw new ApiError(errorType.NOT_FOUND, {
        description: `Модель средства связи #${targetId} не найдена.`,
      });

    const prev = type.toJSON();

    const updated = await type?.update({ ...rest });

    if (typeof details !== "undefined") {
      await PhoneModelDetail.destroy({ where: { modelId: updated.id } });
      await PhoneModelDetail.bulkCreate(
        details.map((detail) => ({ ...detail, modelId: updated.id }))
      );
    }

    Log.log("model", [targetId], "edit", id, {
      before: prev,
      after: type,
      query: req.query,
    });

    res.send({ id: targetId });
  })
);

router.post(
  "/phone/model",
  access("admin"),
  validate({
    body: {
      // accountingDate: tester().required().isDate(),
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
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { phoneTypeId, name, details, description } = req.body;

    const model = await PhoneModel.create({
      // accountingDate: accountingDate.toISOString(),
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
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    try {
      const model = await PhoneModel.destroy({ where: { id } });
      Log.log("model", [id], "delete", user.id);
    } catch (err) {
      if (err instanceof ForeignKeyConstraintError) {
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description:
            "Невозможно удаление модели с существующими средствами связи",
        });
      }
    }

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
  transactionHandler(async (req, res) => {
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
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { description, name } = req.query;

    // try {
    const type = await PhoneType.create({ name, description });
    Log.log("phoneType", [type.id], "create", user.id);
    res.send({ id: type.id });
  })
);

router.put(
  "/phone/type",
  access("admin"),
  validate({
    query: {
      id: tester().isNumber().required(),
      name: tester(),
      description: tester(),
      lifespan: tester(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.params.user;
    const { id: targetId, ...rest } = req.query;

    const type = await PhoneType.findByPk(targetId);
    if (!type)
      throw new ApiError(errorType.NOT_FOUND, {
        description: `Тип средства связи #${targetId} не найдено.`,
      });

    const prev = type.toJSON();

    const updated = await type?.update({ ...rest });

    Log.log("phoneType", [targetId], "edit", id, {
      before: prev,
      after: type,
      query: req.query,
    });

    res.send({ id: targetId });
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
  transactionHandler(async (req, res) => {
    const { user } = req.params;
    const { id } = req.query;

    try {
      const phoneType = await PhoneType.destroy({ where: { id } });
      Log.log("phoneType", [id], "delete", user.id);
    } catch (err) {
      if (err instanceof ForeignKeyConstraintError) {
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description:
            "Невозможно удаление типа средства связи при существовании моделей этого типа",
        });
      }
    }

    res.send();
  })
);

export default router;
