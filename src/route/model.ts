import { Router } from "express";

import Model from "../db/models/model";

const router = Router();

router.get("/", async (req, res) => {
  res.send(await Model.search({}));
});

router.post("/", async (req, res) => {
  const result = Model.create({
    accountingDate: new Date(2000 + 20 * Math.random(), 10, 23),
    name: "test name",
    // color: "Test Color",
  });

  res.send(result);
});

export default router;
