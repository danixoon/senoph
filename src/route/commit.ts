import { getChanges, getUpdater } from "@backend/db/commit";
import { access } from "@backend/middleware/auth";
import { convertValues } from "@backend/middleware/converter";
import { tester, validate } from "@backend/middleware/validator";
import { Router } from "express";
import { AppRouter } from ".";

import Model from "../db/models/phoneModel.model";

const router = AppRouter();

router.get(
  "/commit",
  access("user"),
  validate({ query: { target: tester().required() } }),
  async (req, res) => {
    const { target } = req.query;
    const changes = await getChanges(1, target);
    res.send(changes);
  }
);

router.post(
  "/commit",
  access("user"),
  validate({
    query: { target: tester().required(), targetId: tester().required() },
  }),
  async (req, res) => {
    const { target, targetId } = req.query;
    const changes = req.body;

    const updater = getUpdater(target, targetId, 1);
    await updater.push(changes);

    res.send();
  }
);

router.delete(
  "/commit",
  access("user"),
  validate({
    query: {
      keys: tester().required(),
      targetId: tester().required(),
      target: tester().required(),
    },
  }),
  convertValues({ keys: (c) => c.toArray().value }),
  async (req, res) => {
    const { target, targetId, keys } = req.query;

    const updater = getUpdater(target, targetId, 1);
    updater.clear(...keys);

    res.send();
  }
);

export default router;
