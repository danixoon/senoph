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

type ImportContext<P> = {
  row: { id: any } & P;
  models: DB.PhoneModelAttributes[];
  departments: DB.DepartmentAttributes[];
  holders: DB.HolderAttributes[];

  createHolding: (holding: DB.HoldingAttributes, id: any) => void;
};
type Template<T, K = any, P = any> = {
  label: string;
  id: keyof K;
  validator?: Validator;
  mutator: (
    this: ImportContext<P>,
    value: any,
    target: Partial<T>
  ) => Partial<T>;
};
type Row = { id: any; values: (string | null)[] };

// const extractRow

const templates: {
  phone: Template<
    DB.PhoneAttributes,
    any,
    { department: DB.DepartmentAttributes; holder: DB.HolderAttributes }
  >[];
} = {
  phone: [
    {
      label: "Модель",
      id: "phoneModelId",
      validator: tester().required(),
      mutator: function (v, target) {
        const model = Array.from(this.models.values()).find(
          (model) => model.name === v
        );
        if (!model)
          throw new ApiError(errorType.INVALID_BODY, {
            description: "Несуществующая модель СС: " + v,
          });

        return { ...target, phoneModelId: model?.id };
      },
    },
    {
      label: "Инвентарный номер",
      id: "inventoryKey",
      validator: tester()
        .isNumber()
        .message("Принимаю только числа в столбце inventoryKey")
        .required(),
      mutator: function (v, target) {
        return { ...target, inventoryKey: v };
      },
    },
    {
      label: "Заводской номер",
      id: "factoryKey",
      validator: tester().required(),
      mutator: function (v, target) {
        return { ...target, factoryKey: v };
      },
    },
    {
      label: "Год сборки",
      id: "assebmlyYear",
      validator: tester().isNumber().required(),
      mutator: function (v, target) {
        return { ...target, assemblyDate: new Date(v, 1, 1).toISOString() };
      },
    },
    {
      label: "Дата принятия к учёту",
      id: "accountingDate",
      validator: tester().isDate().required(),
      mutator: function (v, target) {
        return { ...target, accountingDate: v };
      },
    },
    {
      label: "Дата ввода в эксплуатацию",
      id: "comissioningDate",
      validator: tester().isDate().required(),
      mutator: function (v, target) {
        return { ...target, commissioningDate: v };
      },
    },
    {
      label: "Подразделение",
      id: "departmentName",
      validator: tester().required(),
      mutator: function (v: string, target) {
        return target;
      },
    },
    {
      label: "Владелец",
      id: "holderName",
      validator: tester().required(),
      mutator: function (v: string, target) {
        // if (!holder)
        // throw new ApiError(errorType.INVALID_BODY, {
        //   description:
        //     `Несуществующий владелец отделения '${department}' с ФИО '${lastName} ${firstName} ${middleName}' ` +
        //     v,
        // });

        this.createHolding(
          {
            holderId: this.row.holder.id as number,
            orderDate: target.accountingDate as string,
            reasonId: "initial",
          },
          this.row.id
        );

        return target;
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
      key: t.id.toString(),
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
  templates: Template<R, any, T>[],
  row: Row,
  getContext: () => ImportContext<T>
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

    const context = getContext();

    result = template.mutator.call(context, value, result);
  }

  return result as R;
};

const getCellByTemplateId = (
  id: string,
  templates: Template<any>[],
  row: Row
) => {
  const index = templates.findIndex((t) => t.id === id);
  if (index !== -1) return row.values[index];
  else return null;
};

const extractRows = (sheet: exceljs.Worksheet) => {
  const rows: Row[] = [];
  sheet.eachRow((row, i) => {
    const cells: (string | null)[] = [];
    row.eachCell((cell) => {
      const value = cell.value?.toString().trim() ?? null;
      if (typeof value === "string" && value.length === 0) cells.push(null);
      else cells.push(value);
    });
    rows.push({ id: i - 1, values: cells });
  });
  return rows;
};
const importPhones = async (book: exceljs.Workbook) => {
  // Получение данных листа
  const sheet = book.getWorksheet(0);
  const rows = extractRows(sheet);

  if (rows.length === 0)
    throw new ApiError(errorType.INVALID_BODY, {
      description: "Передана пустая таблица",
    });

  // Получение данных отделений, владельцев и моделей телефонов
  const [departments, holders, models] = await Promise.all([
    Department.findAll(),
    Holder.findAll(),
    PhoneModel.findAll(),
  ]);

  // Инициированные движения при создании СС
  const holdings: (DB.HoldingAttributes & { rowIds: string[] })[] = [];
  const phones: DB.PhoneAttributes[] = [];

  for (const row of rows) {
    const phone = processTemplate(templates.phone, row, () => {
      const departmentName = getCellByTemplateId(
        "departmentName",
        templates.phone,
        row
      );
      const [lastName, firstName, middleName] = getCellByTemplateId(
        "holderName",
        templates.phone,
        row
      )?.split(/s+/) ?? ["", "", ""];

      const department = departments.find(
        (d) => d.name.toLowerCase() === departmentName?.toLowerCase()
      );
      const holder = holders.find(
        (h) =>
          h.firstName.toLowerCase() === firstName.toLowerCase() &&
          h.lastName.toLowerCase() === lastName.toLowerCase() &&
          h.middleName.toLowerCase() === middleName.toLowerCase()
      );

      if (!department)
        throw new ApiError(errorType.INVALID_BODY, {
          description: "Указано несуществующее отделение",
        });
      if (!holder)
        throw new ApiError(errorType.INVALID_BODY, {
          description: `Указан несуществующий владелец в отделении '${departmentName}'`,
        });

      return {
        departments,
        holders,
        models,
        row: {
          department,
          holder,
          id: row.id,
        },
        createHolding: (holding, id) => {
          const existing = holdings.find(
            (h) => h.holderId === holding.holderId
          );
          if (existing) existing.rowIds.push(id);
          else holdings.push({ ...holding, rowIds: [id] });
          // !holdings.find(h => h.holderId === holding.holderId) &&
          // holdings.push({ ...holding, phoneRandomId: id }),
        },
      };
    });

    phones.push(phone);
  }

  const [dbPhones, dbHoldings] = await Promise.all([
    Phone.bulkCreate(phones),
    Holding.bulkCreate(holdings),
  ]);
  const holdingPhones: DB.HoldingPhoneAttributes[] = holdings.flatMap(
    (holding) =>
      holding.rowIds.map((id) => ({
        phoneId: dbPhones[Number(id)].id,
        holdingId: dbHoldings.find((h) => h.holderId === holding.holderId)?.id,
      }))
  );

  HoldingPhone.bulkCreate(holdingPhones);

  // Объект контекста
  // const context: ImportContext = ({
  //   departments, holders, models, createHolding: (holding, uuid) => {
  //     // Проверка на дубликаты в holdings, нет смысла добавлять одинаковые
  //     const existing = holdings.find(hold => hold.id === holding.id);
  //     if (existing && existing.orderDate === holding.orderDate && existing.reasonId === existing.reasonId) return;

  //     holdings.push({ ...holding, phoneRandomId: uuid })
  //   }
  // });

  type PhoneWithHolderId = DB.PhoneAttributes & { holderId: number };

  // const data: PhoneWithHolderId[] = [];
  // const sheet = book.getWorksheet(0);
  // sheet.eachRow((row, rowI) => {
  //   const selfContext = {} as any;
  //   let target = (data[rowI] ?? {}) as Partial<DB.PhoneAttributes>;

  //   row.eachCell((cell, colI) => {
  //     const template = templates.phone[colI];
  //     if (!template)
  //       throw new Error(
  //         `Значение в ячейке (${rowI},${colI}) выходит за границы диапазона.`
  //       );

  //     let value = cell.value?.toString() as any;
  //     if (template.validator)
  //       value = validateSchema(
  //         { value: template.validator },
  //         { value },
  //         { target: "query" }
  //       ).value;

  //     target = template.mutator.call(context, [value, target, selfContext]);
  //   });

  //   data.push({ ...(target as DB.PhoneAttributes), holderId: selfContext.holder.id });
  // });

  // if (data.length === 0) throw new ApiError(errorType.INVALID_BODY, { description: "Передана пустая таблица" })

  // const [dbPhones, dbHoldings] = await Promise.all([Phone.bulkCreate(data), Holding.bulkCreate(holdings)]);

  // const groupedByHolderId = data.reduce((a, v) => ({ ...a, [v.holderId]: [...(a[v.holderId] ?? []), v] }), {} as Record<number, PhoneWithHolderId[]>);
  // const holdingPhonesData: DB.HoldingPhoneAttributes[] = Object.entries(groupedByHolderId).flatMap(([holderId, data]) => ({ holdingId:   }))
};

router.post(
  "/import",
  access("user"),
  uploadMemory(".xlsx").single("file"),
  validate({ query: { target: tester().isIn(["phone"]).required() } }),
  handler(async (req, res, next) => {
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
        await importPhones(workbook);
        break;
      default:
        throw new ApiError(errorType.INVALID_QUERY, {
          description: "Импорт данного вида недоступен.",
        });
    }

    res.send();

    //const cell = workbook.worksheets[0].getCell(2, 1);

    //console.log(cell.text);

    //res.send(cell.text);
  })
);

export default router;
