import { Router } from "express";

import Phone from "../db/models/phone.model";
import Model from "../db/models/phoneModel.model";
import { prepareItems } from "@backend/utils";
import PhoneModel from "../db/models/phoneModel.model";
import Holder from "@backend/db/models/holder.model";
import { Op } from "sequelize";
import PhoneCategory from "@backend/db/models/phoneCategory.model";
import Department from "@backend/db/models/department.model";

const router = Router();

router.get("/", async (req, res) => {
  const {
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
  } = req.query as any as ApiRequest.FetchPhones;

  const order = [] as any;
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

  const phones = await Phone.findAll({
    where: {
      phoneModelId: valueOrNotNull(phoneModelId),
      inventoryKey: valueOrNotNull(inventoryKey),
      factoryKey: valueOrNotNull(factoryKey),
    },
    include: [
      {
        model: PhoneModel,
        where: { phoneTypeId: valueOrNotNull(phoneTypeId) },
      },
      {
        model: Holder,
        where: { departmentId: valueOrNotNull(departmentId) },
        include: [
          {
            model: Department,
          },
        ],
      },
      {
        model: PhoneCategory,
        where: { category: valueOrNotNull(category) },
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
  const rows = (phones ?? []).slice(offset_, offset_ + limit_);

  if (phones) res.send(prepareItems(rows, phones.length, offset_));
  else res.sendStatus(500).send("error");
});

router.post("/", async (req, res) => {
  // await Model.create({ color: "Чёрный", name: "Gigaset A420" });
  // const result = Phone.create({
  //   accountingDate: new Date(200 0 + 20 * Math.random(), 10, 23).toISOString(),
  //   assemblyDate: new Date(2000 + 20 * Math.random(), 10, 23).toISOString(),
  //   commissioningDate: new Date(
  //     2000 + 20 * Math.random(),
  //     10,
  //     23
  //   ).toISOString(),
  //   factoryId: new Array(10)
  //     .fill(0)
  //     .map((v) =>
  //       String.fromCharCode("0".charCodeAt(0) + Math.floor(30 * Math.random()))
  //     )
  //     .join(""),
  //   inventoryId: new Array(10)
  //     .fill(0)
  //     .map((v) =>
  //       String.fromCharCode("0".charCodeAt(0) + Math.floor(30 * Math.random()))
  //     )
  //     .join(""),
  //   modelId: 1,
  // });
  // res.send(result);
});

export default router;
