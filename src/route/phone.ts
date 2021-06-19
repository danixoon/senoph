import { Router } from "express";

import Phone from "../db/models/phone";
import Model from "../db/models/model";
import { prepareResponse } from "@backend/utils";

const router = Router();

const generateItem = () => ({
  id: Math.floor(Math.random() * 1000),
  modelId: Math.floor(Math.random() * 1000),
  date: new Date(2000 + 20 * Math.random(), 1),
});

router.get("/", async (req, res) => {
  const result = await Phone.search({});
  res.send(result);
});

router.post("/", async (req, res) => {
  // await Model.create({ color: "Чёрный", name: "Gigaset A420" });
  // const result = Phone.create({
  //   accountingDate: new Date(2000 + 20 * Math.random(), 10, 23).toISOString(),
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
