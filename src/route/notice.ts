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
import Category from "@backend/db/models/category.model";
import { Op } from "sequelize";
import CategoryPhone from "@backend/db/models/categoryPhone.model";
import Holding from "@backend/db/models/holding.model";
import HoldingPhone from "@backend/db/models/holdingPhone.model";
import Phone from "@backend/db/models/phone.model";
import Change from "@backend/db/models/change.model";

const router = AppRouter();

router.get(
  "/notice",
  access("user"),
  validate({ query: {} }),
  transactionHandler(async (req, res, next) => {
    const notice: Api.Models.Notice = {
      category: {
        commits: await Category.count({
          where: { status: { [Op.not]: null } },
        }),
        changes: await CategoryPhone.count({
          where: { status: { [Op.not]: null } },
        }),
      },
      holding: {
        commits: await Holding.count({
          where: { status: { [Op.not]: null } },
        }),
        changes: await HoldingPhone.count({
          where: { status: { [Op.not]: null } },
        }),
      },

      phone: {
        changes: await Change.count({ where: { target: "phone" } }),
        commits: await Phone.count({
          where: { status: { [Op.not]: null } },
        }),
      },
    };

    res.send(notice);
  })
);

export default router;
