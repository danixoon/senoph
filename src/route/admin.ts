import path from "path";
import { promises as fs } from "fs";
import { tester, validate } from "@backend/middleware/validator";
import { AppRouter } from "../router";
import { ApiError, errorType } from "@backend/utils/errors";
import { access } from "@backend/middleware/auth";
import { transactionHandler, prepareItems } from "../utils";
import Log from "@backend/db/models/log.model";
import {
  createBackup,
  getBackups,
  removeBackup,
  revertBackup,
} from "@backend/db/backup";

const router = AppRouter();

router.get(
  "/admin/backups",
  access("admin"),
  validate({ query: {} }),
  transactionHandler(async (req, res, next) => {
    const backupDir = path.resolve(__dirname, "../../backup/");

    const dir = await fs.readdir(backupDir);
    const result = await Promise.all(
      dir.map(async (v) => {
        const stats = await fs.stat(
          path.resolve(__dirname, "../../backup/", v)
        );
        const [timestamp, id, tag] = v.split("_");
        return {
          id,
          date: new Date(parseInt(timestamp)).toISOString(),
          tag: tag.split(".")[0],
          size: stats.size,
        };
      })
    );

    res.send(prepareItems(result, result.length, 0));
  })
);

router.post(
  "/admin/backup",
  access("admin"),
  validate({
    query: {
      tag: tester().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { tag } = req.query;
    const { id } = await createBackup(tag);

    res.send({ id });
  })
);

router.post(
  "/admin/backup/revert",
  access("admin"),
  validate({
    query: {
      id: tester().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.query;
    const [targetBackup] = await getBackups({ id });

    if (!targetBackup)
      throw new ApiError(errorType.NOT_FOUND, {
        description: "Резервной копии с данным ID не найдено.",
      });

    await revertBackup(targetBackup);

    res.send({ id });
  })
);

router.delete(
  "/admin/backup",
  access("admin"),
  validate({
    query: {
      id: tester().required(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { id } = req.query;
    const [targetBackup] = await getBackups({ id });

    if (!targetBackup)
      throw new ApiError(errorType.NOT_FOUND, {
        description: "Резервной копии с данным ID не найдено.",
      });

    await removeBackup(targetBackup);

    res.send();
  })
);

export default router;
