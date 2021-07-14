import { getChanges, getUpdater } from "@backend/db/commit";
import { access } from "@backend/middleware/auth";
import { convertValues } from "@backend/middleware/converter";
import { Router } from "express";
import { AppRouter } from ".";

import Model from "../db/models/phoneModel.model";

const router = AppRouter();

router.get("/commit", async (req, res) => {
  const { target } = req.query as any;
  const changes = await getChanges(1, target);
  res.send(changes);
});

router.post("/commit", async (req, res) => {
  const { target, targetId } = req.query as any;
  const changes = req.body as any;

  const updater = getUpdater(target, targetId, 1);
  try {
    await updater.push(changes);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete(
  "/commit",
  convertValues({ keys: (c) => c.toArray().value }),
  async (req, res) => {
    const { target, targetId, keys } = req.query as any;
    const updater = getUpdater(target, targetId, 1);
    try {
      updater.clear(...keys);

      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(500);
    }
  }
);

// router.post("/", async (req, res) => {
//   const result = Model.create({
//     accountingDate: new Date(2000 + 20 * Math.random(), 10, 23),
//     name: "test name",
//     // color: "Test Color",
//   });

//   res.send(result);
// });

export default router;
