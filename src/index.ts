import http from "http";
import path from "path";
import express, { Router } from "express";
import dotenv from "dotenv";
import * as bodyParser from "body-parser";
import { logger } from "@backend/utils/index";
import { logger as logRequest } from "@backend/middleware/logger";

dotenv.config();

import { init as initDb, close as closeDb } from "@backend/db/index";
import { errorHandler } from "@backend/middleware/error";
import { routers } from "./route";

let server: http.Server | null;

export const init = async () => {
  if (server) throw new Error("server already started.");
  const app = express();

  app.use(bodyParser.json());
  app.use(logRequest());
  app.use("/api", ...routers);

  app.use("/build", express.static(path.resolve(__dirname, "../client/build")));
  app.use("*", express.static(path.resolve(__dirname, "../client/build")));

  app.use(errorHandler);

  server = http.createServer(app);

  const port = Number(process.env.PORT) || 5000;

  server.listen(port, async () => {
    await Promise.all([initDb()]);
    logger.info(`Сервер запущен`, {
      service: "server",
      payload: { port },
    });
  });

  server.on("error", (err) => {
    logger.error(err.message, err);
  });
};

export const close = async () => {
  if (!server) throw new Error("server already closed.");
  await new Promise<void>((res, rej) =>
    server?.close((e) => (e ? rej(e) : res()))
  );
  await closeDb();
  server = null;
};

if (process.env.NODE_ENV !== "test") init();
