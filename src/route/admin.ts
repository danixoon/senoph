import path from "path";
import crypto from "crypto-js";
import readline from "readline";
import stream from "stream";
import { v4 as uuid } from "uuid";
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
  parseStats,
  ParsingError,
  removeBackup,
  revertBackup,
} from "@backend/db/backup";
import { uploadMemory } from "@backend/middleware/upload";

const { version } = require("../../package.json");

const router = AppRouter();

router.get(
  "/admin/backup/export",
  access("admin"),
  validate({ query: { id: tester().required() } }),
  transactionHandler(async (req, res, next) => {
    const { id } = req.query;
    const [targetBackup] = await getBackups({ id });

    if (!targetBackup)
      throw new ApiError(errorType.NOT_FOUND, {
        description: "Резервной копии с данным ID не найдено.",
      });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${targetBackup}.sbac`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    const file = await fs.readFile(
      path.resolve(__dirname, "../../backup/", targetBackup)
    );

    const based = file.toString("base64");

    res.send(based as any);
  })
);

router.get(
  "/admin/backups",
  access("admin"),
  validate({ query: {} }),
  transactionHandler(async (req, res, next) => {
    // const backupDir = path.resolve(__dirname, "../../backup/");

    const backups = await getBackups({});

    const result = await Promise.all(
      backups.map(async (v) => {
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

router.post(
  "/admin/backup/import",
  access("admin"),
  uploadMemory(".sbac").single("file"),
  validate({ query: { unsafe: tester().isBoolean() } }),
  transactionHandler(async (req, res, next) => {
    const { user } = req.params;
    const { unsafe } = req.query;
    const file = req.file;

    if (!file)
      throw new ApiError(errorType.INVALID_BODY, {
        description: "Файл обязателен",
      });

    const data = Buffer.from(file.buffer.toString(), "base64").toString("utf8");
    const rl = readline.createInterface({ input: stream.Readable.from(data) });

    const line = await new Promise<string>((res) =>
      rl.on("line", (str) => {
        res(str);
        rl.close();
      })
    );

    try {
      const stats = parseStats(line.substring(2));

      const statsVer = stats.VERSION.split(".").slice(0, 2).join("");
      const serverVer = version.split(".").slice(0, 2).join("");

      if (!unsafe) {
        if (statsVer !== serverVer)
          throw new ApiError("INVALID_BODY", {
            description: `Версия резервной копии (${stats.VERSION}) не поддерживается сервером (${version}).`,
          });

        const content = data.slice(line.length + 1, data.length);

        const hash = crypto
          .HmacSHA256(content, process.env.SECRET)
          .toString(crypto.enc.Hex);

        if (hash !== stats.SHA)
          throw new ApiError(errorType.INVALID_BODY, {
            description: "Проверка целостности резервной копии не удалась.",
          });
      }

      const id = uuid();

      await fs.writeFile(
        path.resolve(
          __dirname,
          "../../backup/",
          `${new Date(stats.DATE).getTime()}_${id}_${stats.TAG ?? "normal"}.sql`
        ),
        data
      );

      res.send({ id });
    } catch (err) {
      if (err instanceof ParsingError) {
        throw new ApiError(errorType.VALIDATION_ERROR, {
          description: "Некорректный файл резервной копии.",
        });
      } else throw err;
    }
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
