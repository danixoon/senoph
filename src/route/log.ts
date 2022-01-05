import { promises as fs } from "fs";
import path from "path";

// import department from "@backend/db/models/department";
import { AppRouter } from "../router";
import { transactionHandler, prepareItems } from "../utils";
import { access } from "@backend/middleware/auth";
import { tester, validate } from "@backend/middleware/validator";
import Log from "@backend/db/models/log.model";
import LogTarget from "@backend/db/models/logTarget.model";
import { ApiError, errorType } from "@backend/utils/errors";

const router = AppRouter();

router.get(
  "/logs",
  access("admin"),
  validate({
    query: {
      amount: tester().isNumber(),
      offset: tester().isNumber(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { amount, offset } = req.query;
    const logs = await Log.findAndCountAll({
      include: [{ model: LogTarget, subQuery: true, separate: true }],
      offset,
      limit: amount,
    });

    res.send(
      prepareItems(
        logs.rows.map((log) => log as Api.Models.Log),
        logs.count,
        0
      )
    );
  })
);

router.get(
  "/log/system",
  access("admin"),
  validate({
    query: {
      amount: tester().isNumber(),
      offset: tester().isNumber(),
    },
  }),
  transactionHandler(async (req, res) => {
    const { amount, offset } = req.query;

    const max = 1024 * 1024 * 8;
    if (amount > max)
      throw new ApiError(errorType.INVALID_QUERY, {
        description: "Максимльный размер лога: " + max + " байт.",
      });

    const logPath = path.resolve(__dirname, "../../logs/combined.log");
    const file = await fs.open(logPath, "r");
    const stat = await file.stat();

    const buffer = Buffer.alloc(amount);
    const log = await file.read(
      buffer,
      0,
      amount,
      Math.max(0, stat.size - offset - amount)
    );

    const text = buffer.toString("utf8");

    const items: any[] = [];
    text.split("\n").forEach((value) => {
      try {
        const content = JSON.parse(value);
        items.unshift(content);
      } catch (err) {
        //
      }
    });

    await file.close();

    // file.close();

    // const items = [];
    // const content = [];
    // // const endl = "\
    // for (const byte of log.buffer) {
    //   if (byte === 10)
    //     items.push(JSON.parse(unescape(encodeURIComponent(content))));
    //   else content += String.fromCharCode(byte);
    // }

    res.send(prepareItems(items, log.bytesRead, offset));
  })
);

export default router;
