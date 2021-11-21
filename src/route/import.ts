import { Router } from "express";
import { v4 as uuid } from "uuid";
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
import {
  tester,
  validate,
  validateSchema,
  Validator,
} from "@backend/middleware/validator";
import exceljs from "exceljs";
import multer from "multer";
import { upload, uploadMemory } from "@backend/middleware/upload";
import { template } from "@babel/core";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import Holding from "@backend/db/models/holding.model";

type ImportContext<P, T> = {
  row: Row;
  items: T[];
} & P;
type Template<T, P = any> = {
  label: string;
  validator?: Validator;
  mutator: (
    this: ImportContext<P, T>,
    value: any,
    target: Partial<T>
  ) => Partial<T>;
};
type Row = { id: any; values: (string | null)[] };

// const extractRow

const templates: {
  phone: Template<DB.PhoneAttributes, { models: DB.PhoneModelAttributes[] }>[];
} = {
  phone: [
    {
      label: "Модель",
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
      validator: tester().required(),
      mutator: function (v, target) {
        if (this.items.some((m) => m.inventoryKey === v))
          throw new ApiError(errorType.VALIDATION_ERROR, {
            description: `В строке ${this.row.id} присутствует дублирующийся инвентарный номер.`,
          });
        return { ...target, inventoryKey: v };
      },
    },
    {
      label: "Заводской номер",
      validator: tester().required(),
      mutator: function (v, target) {
        if (this.items.some((m) => m.factoryKey === v))
          throw new ApiError(errorType.VALIDATION_ERROR, {
            description: `В строке ${this.row.id} присутствует дублирующийся заводской номер.`,
          });

        return { ...target, factoryKey: v };
      },
    },
    {
      label: "Год сборки",
      validator: tester().isNumber().required(),
      mutator: function (v, target) {
        return {
          ...target,
          assemblyDate: new Date(v, 1, 1).toISOString(),
        };
      },
    },
    {
      label: "Дата принятия к учёту",
      validator: tester().isDate().required(),
      mutator: function (v, target) {
        return { ...target, accountingDate: v };
      },
    },
    {
      label: "Дата ввода в эксплуатацию",
      validator: tester().isDate().required(),
      mutator: function (v, target) {
        return { ...target, commissioningDate: v };
      },
    },
  ],
};

const router = AppRouter();

router.get(
  "/import",
  // access("user"),
  validate({ query: { entity: tester().required().isIn(["phone", "model"]) } }),
  handler(async (req, res, next) => {
    const { entity } = req.query;

    const template = templates[entity];

    const workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("Шаблон");

    sheet.columns = template.map((t) => ({
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

type WithRandomId<T, K extends string = "randomId"> = T & Record<K, string>;

const processTemplate = <T, R>(
  templates: Template<R, T>[],
  row: Row,
  getContext: () => Omit<ImportContext<T, R>, "row">
) => {
  let result: Partial<R> = {};

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    let value = row.values[i] as any;

    if (template.validator)
      value = validateSchema(
        { value: template.validator },
        { value },
        { target: "body" }
      ).value;

    const context = { ...getContext(), row };

    result = template.mutator.call(context, value, result);
  }

  return result as R;
};

const extractRows = (sheet: exceljs.Worksheet) => {
  const rows: Row[] = [];
  sheet.eachRow((row, i) => {
    if (i === 1) return;
    const cells: (string | null)[] = [];
    row.eachCell((cell) => {
      const value = cell.value?.toString().trim() ?? null;
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

  const phones: Omit<DB.PhoneAttributes, "authorId">[] = [];
  const models = await PhoneModel.findAll();

  for (const row of rows) {
    const phone = processTemplate(templates.phone, row, () => ({
      models,
      items: phones,
    }));
    phones.push({ ...phone });
  }

  return phones;
};

router.post(
  "/import",
  access("user"),
  uploadMemory(".xlsx").single("file"),
  validate({ query: { target: tester().isIn(["phone"]).required() } }),
  handler(async (req, res, next) => {
    const { user } = req.params;
    const { target } = req.query;
    const file = req.file;

    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл обязателен",
      });

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(file.buffer);

    switch (target) {
      case "phone":
        const phones = await parsePhonesFile(workbook);
        res.send(prepareItems(phones, phones.length, 0));
        break;
      default:
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "Импорт данного вида недоступен.",
        });
    }
  })
);

export default router;
