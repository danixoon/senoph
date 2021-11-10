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
import { tester, validate, Validator } from "@backend/middleware/validator";
import exceljs from "exceljs";
import multer from "multer";
import { uploadMemory } from "@backend/middleware/upload";

type Template = { label: string; id: string; validator?: Validator };

const templates = {
  phone: [
    {
      label: "Инвентарный номер",
      id: "inventoryKey",
      validator: tester()
        .isNumber()
        .message("Принимаю только числа в столбце inventoryKey"),
    },
    {
      label: "Заводской номер",
      id: "factoryKey",
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
      key: t.id,
      style: { font: { bold: true }, alignment: { horizontal: "center" } },
    }));

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

router.post(
  "/import/phone",
  access("user"),
  validate({ body: { file: tester().required() } }),
  uploadMemory(".xlsx").single("file"),
  handler(async (req, res, next) => {
    const {} = req.query;
    const file = req.file;

    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл обязателен",
      });

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(file.buffer);

		const cell = workbook.worksheets[0].getCell(2, 1); 

		res.send(cell.text);
  })
);

export default router;
