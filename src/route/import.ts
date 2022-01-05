import { Router } from "express";
import { v4 as uuid } from "uuid";
import Phone from "../db/models/phone.model";
import Model from "../db/models/phoneModel.model";
import { transactionHandler, prepareItems } from "@backend/utils/index";
import PhoneModel from "../db/models/phoneModel.model";
import Holder from "@backend/db/models/holder.model";
import { Op, Order, OrderItem, WhereOperators } from "sequelize";
import Category from "@backend/db/models/category.model";
import Department from "@backend/db/models/department.model";
import { convertValues } from "@backend/middleware/converter";
import { AppRouter } from "../router";
import { ApiError, errorType } from "../utils/errors";
import { access } from "@backend/middleware/auth";
import {
  tester,
  validate,
  validateSchema,
  ValidationError,
  Validator,
} from "@backend/middleware/validator";
import exceljs from "exceljs";
import multer from "multer";
import { upload, uploadMemory } from "@backend/middleware/upload";
import { template } from "@babel/core";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import Holding from "@backend/db/models/holding.model";
import { groupBy } from "@backend/utils/index";
import { modelsToMap } from "@backend/db/utils";

type ImportContext<P, T> = {
  row: Row;
  items: T[];
} & P;
type Template<T, P = any> = {
  validator?: (this: ImportContext<P, T>, item: T) => void;
  columns: ColumnTemplate<T, P>[];
};
type ColumnTemplate<T, P = any> = {
  label: string;
  key: string;
  validator?: Validator;
  finalValidator?: (this: ImportContext<P, T>, final: T) => void;
  optional?: boolean;
  mutator: (
    this: ImportContext<P, T>,
    value: any,
    target: Partial<T>
  ) => Partial<T>;
};
type Row = { id: any; values: (string | null)[] };

// const extractRow

const templates: {
  phone: Template<
    DB.PhoneAttributes & {
      payload: {
        holderName?: string;
        departmentName?: string;
        orderDate?: Date;
        orderKey?: string;
      };
    },
    { models: DB.PhoneModelAttributes[] }
  >;
} = {
  phone: {
    validator: function ({ payload }) {
      if (payload.departmentName && !payload.holderName)
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description: `Указано подразделение без владельца.`,
          payload: { rowId: this.row.id },
        });

      // TODO: Если номер приказа будет 0?
      if ((payload.orderKey || payload.orderDate) && !payload.holderName)
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description: `Владелец должен быть указан`,
          payload: { rowId: this.row.id },
        });

      if (
        this.items.some(
          (item) =>
            item.payload?.orderKey === payload.orderKey &&
            item.payload?.orderDate?.getTime() ===
              payload.orderDate?.getTime() &&
            item.payload?.holderName !== payload.holderName
        )
      )
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description:
            "Дубликат имени владельца с одинаковой парой 'дата документа' и 'номер документа'",
        });

      // const differentOrderDate = this.items.find(
      //   (item) =>
      //     item.payload.orderKey === payload.orderKey &&
      //     item.payload.orderDate !== payload.orderDate
      // );

      // if (differentOrderDate) {
      //   throw new ApiError(errorType.VALIDATION_ERROR, {
      //     description: `Разные даты у актов с одинаковым номером`,
      //     payload: { rowId: this.row.id },
      //   });
      // }
    },
    columns: [
      {
        label: "Модель*",
        key: "labelName",
        validator: tester().required(),
        mutator: function (v, target) {
          const model = this.models.find((model) => model.name === v);
          if (!model)
            throw new ApiError(errorType.INVALID_BODY, {
              description: "Несуществующая модель СС: " + v,
            });

          return { ...target, phoneModelId: model.id };
        },
      },
      {
        label: "Инвентарный номер",
        key: "inventoryKey",
        validator: tester(),
        mutator: function (v, target) {
          if (
            this.items.some(
              (m) => m.inventoryKey != null && v != null && m.inventoryKey === v
            )
          )
            throw new ApiError(errorType.VALIDATION_ERROR, {
              description: `В строке ${this.row.id} присутствует дублирующийся инвентарный номер.`,
            });
          return { ...target, inventoryKey: v };
        },
      },
      {
        label: "Заводской номер",
        key: "factoryKey",
        validator: tester(),
        mutator: function (v, target) {
          if (
            this.items.some(
              (m) => m.factoryKey != null && v != null && m.factoryKey === v
            )
          )
            throw new ApiError(errorType.VALIDATION_ERROR, {
              description: `В строке ${this.row.id} присутствует дублирующийся заводской номер.`,
            });

          return { ...target, factoryKey: v };
        },
      },
      {
        label: "Год сборки*",
        key: "assemblyYear",
        validator: tester().isNumber().required(),
        mutator: function (v, target) {
          return {
            ...target,
            assemblyDate: new Date(v, 1, 1).toISOString(),
          };
        },
      },
      {
        label: "Дата принятия к учёту*",
        key: "accountingDate",
        validator: tester().isDate().required(),
        mutator: function (v, target) {
          return { ...target, accountingDate: v };
        },
      },
      {
        label: "Дата ввода в эксплуатацию*",
        key: "comissioningDate",
        validator: tester().isDate().required(),
        mutator: function (v, target) {
          return { ...target, commissioningDate: v };
        },
      },
      {
        label: "Подразделение",
        key: "departmentName",
        validator: tester(),
        mutator: function (v, target) {
          const payload = target.payload ?? {};
          payload.departmentName = v;

          return { ...target, payload };
        },
      },
      {
        label: "Владелец",
        key: "holderName",
        validator: tester(),
        mutator: function (v, target) {
          const payload = target.payload ?? {};
          payload.holderName = v;
          return { ...target, payload };
        },
      },
      {
        label: "Дата документа",
        key: "orderDate",
        validator: tester().isDate(),
        mutator: function (v, target) {
          const payload = target.payload ?? {};
          payload.orderDate = v;
          return { ...target, payload };
        },
      },
      {
        label: "Номер документа",
        key: "orderKey",
        validator: tester(),
        mutator: function (v, target) {
          const payload = target.payload ?? {};
          payload.orderKey = v;
          return { ...target, payload };
        },
      },
    ],
  },
};

const router = AppRouter();

router.get(
  "/import",
  // access("user"),
  validate({ query: { entity: tester().required().isIn(["phone", "model"]) } }),
  transactionHandler(async (req, res, next) => {
    const { entity } = req.query;

    const template = templates[entity];

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("Шаблон");

    sheet.columns = template.columns.map((t) => ({
      header: t.label,
    }));

    const row = sheet.getRow(1);

    row.font = { bold: true };
    row.alignment = { horizontal: "center" };

    sheet.columns.forEach(
      (col) => (col.width = (col.header as string).length * 1.4)
    );

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Disposition", `attachment; filename=${entity}.xlsx`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  })
);

const processTempalte = <R, T, L>(
  template: Template<R, T>,
  rows: Row[],
  getContext: (row: Row) => Omit<ImportContext<T, L>, "row" | "items">,
  cb: (item: R, row: Row) => void
) => {
  const items: R[] = [];
  rows.forEach((row) => {
    const item = processTemplateColumn(template, row, (r) => ({
      ...getContext(r),
      items,
    }));

    cb(item, row);

    items.push(item);
  });

  return items;
};

const processTemplateColumn = <R, T, L>(
  template: Template<R, T>,
  row: Row,
  getContext: (row: Row) => Omit<ImportContext<T, L>, "row" | "items">
) => {
  let result: Partial<R> = {};

  const context = { ...getContext(row), row };

  const columns = template.columns;

  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    let value = row.values[i] as any;

    const key = column.key;

    if (column.validator)
      value = validateSchema(
        { [key]: column.validator },
        { [key]: value },
        { target: "body" }
      )[key];

    result = column.mutator.call(context, value, result);
  }

  const payload = result as R;

  if (template.validator) template.validator.call(context, payload);

  return payload;
};

const extractRows = (sheet: exceljs.Worksheet) => {
  const rows: Row[] = [];
  sheet.eachRow((row, i) => {
    if (i === 1) return;
    const cells: (string | null)[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      const trimmed = cell.value?.toString().trim() ?? null;
      const value = trimmed == null ? null : trimmed.replace(/ +(?= )/g, "");
      if (typeof value === "string" && value.length === 0) cells.push(null);
      else cells.push(value);
    });
    // 1 за заголовок, 1 за excel-стайл отсчёта с единицы
    rows.push({ id: i - 2, values: cells });
  });
  return rows;
};
const parsePhonesFile = async (book: exceljs.Workbook) => {
  // Получение данных листа
  const sheet = book.getWorksheet(1);
  const rows = extractRows(sheet);

  if (rows.length === 0)
    throw new ApiError(errorType.INVALID_BODY, {
      description: "Передана пустая таблица",
    });

  const phones: WithRandomId<Omit<DB.PhoneAttributes, "authorId">>[] = [];
  const holdings: (Omit<DB.HoldingAttributes, "authorId" | "reasonId"> & {
    phoneRandomIds: string[];
    merge: boolean;
  })[] = [];
  const [models, departments, holders] = await Promise.all([
    PhoneModel.findAll(),
    Department.findAll(),
    Holder.findAll(),
  ]);

  processTempalte(
    templates.phone,
    rows,
    () => ({ models }),
    ({ payload, ...phone }, row) => {
      const payloadArr = [
        payload.departmentName,
        payload.holderName,
        payload.orderDate,
        payload.orderKey,
      ];

      const randomId = uuid();

      if (payloadArr.some((v) => v))
        if (payloadArr.some((v) => !v))
          throw new ApiError(errorType.VALIDATION_ERROR, {
            description:
              "Данные начального движения для сс должны быть указаны полностью, либо не указаны вовсе.",
          });
        else {
          const targetDepartment = payload.departmentName
            ? departments.find(
                (dep) =>
                  dep.name.toLowerCase() ===
                  payload.departmentName?.toLowerCase()
              )
            : null;

          if (!targetDepartment)
            throw new ApiError(errorType.VALIDATION_ERROR, {
              description: `Не удалось найти подразделение ${payload.departmentName}`,
              payload: { rowId: row.id },
            });

          const targetHolder = payload.holderName
            ? holders.find(
                (holder) =>
                  `${holder.lastName} ${holder.firstName} ${holder.middleName}`.toLowerCase() ===
                  (payload.holderName ?? "")
                    .split(/\s+/)
                    .join(" ")
                    .toLowerCase()
              )
            : null;

          if (!targetHolder)
            throw new ApiError(errorType.VALIDATION_ERROR, {
              description: `Не удалось найти владельца ${payload.holderName} ${
                targetDepartment
                  ? `в поздразделении ${targetDepartment.name}`
                  : ""
              }`.trimEnd(),
              payload: { rowId: row.id },
            });

          // Создание движения
          if (targetHolder) {
            const existing = holdings.find(
              (holding) =>
                holding.orderKey === payload.orderKey &&
                new Date(holding.orderDate).getFullYear() ===
                  new Date(payload.orderDate ?? 0).getFullYear()
            );
            if (existing) existing.phoneRandomIds.push(randomId);
            else
              holdings.push({
                phoneRandomIds: [randomId],
                orderDate: (payload.orderDate as Date).toISOString(),
                holderId: targetHolder.id,
                departmentId: targetDepartment.id,
                orderKey: payload.orderKey as string,
                merge: false,
              });
          }
        }
      phones.push({ ...phone, randomId });
    }
  );

  const existingHoldings = await Holding.findAll({
    where: { orderKey: { [Op.in]: holdings.map((h) => h.orderKey) } },
  });

  existingHoldings.forEach((holding) => {
    const ex = holdings.find(
      (h) =>
        new Date(h.orderDate).getFullYear() ===
          new Date(holding.orderDate).getFullYear() &&
        h.orderKey === holding.orderKey
    );

    if (ex) {
      ex.merge = true;
      ex.id = holding.id;
    }
  });

  // Движения, которые уже существуют в бд
  // if (ex.length > 0) {
  //   ex.forEach((holding) => {
  //     holding;
  //   });
  // throw new ApiError(errorType.VALIDATION_ERROR, {
  //   description: `В базе данных уже присутствует движение с приказом от '${new Date(
  //     ex.orderDate
  //   ).getFullYear()}' года и номером приказа '${ex.orderKey}'.`,
  // });
  // }

  return { phones, holdings };
};

router.post(
  "/import",
  access("admin"),
  validate({}),
  transactionHandler((req, res) => {})
);

router.post(
  "/import/file",
  access("user"),
  uploadMemory(".xlsx").single("file"),
  validate({ query: { target: tester().isIn(["phone"]).required() } }),
  transactionHandler(async (req, res, next) => {
    const { user } = req.params;
    const { target } = req.query;
    const file = req.file;

    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл обязателен",
      });

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(file.buffer);

    try {
      switch (target) {
        case "phone":
          const { phones, holdings } = await parsePhonesFile(workbook);
          res.send({ phones, holdings });
          break;
        default:
          throw new ApiError(errorType.INVALID_QUERY, {
            description: "Импорт данного вида недоступен.",
          });
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description: err.message,
          ...err,
        });
      } else throw err;
    }
  })
);

export default router;
