import http from "http";
import path from "path";
import express, { Router } from "express";
import dotenv from "dotenv";
import * as bodyParser from "body-parser";
import {
  transactionHandler,
  logger,
  handler,
  validateEnv,
} from "@backend/utils/index";
import { logger as logRequest } from "@backend/middleware/logger";

dotenv.config(
  process.env.NODE_ENV === "production"
    ? { path: path.resolve(__dirname, "../.production.env") }
    : {}
);

import { init as initDb, close as closeDb } from "@backend/db/index";
import { errorHandler, notFoundHandler } from "@backend/middleware/error";
import { routers } from "./route";
import { ApiError, errorType } from "./utils/errors";
import { revertBackup, createBackup } from "./db/backup";

let server: http.Server | null;
let isStarted = false;

export const init = async () => {
  if (server) throw new Error("Сервер уже запущен.");

  validateEnv();

  const app = express();

  const port = process.env.PORT || 5000;

  logger.info(`Сервер запускается`, {
    service: "server",
    payload: { port },
  });

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(logRequest());

  app.use(
    "*",
    handler((req, res, next) => {
      if (isStarted) next();
      else
        throw new ApiError(errorType.SERVER_NOT_STARTED, {
          description: "Сервер всё ещё запускается",
        });
    })
  );

  app.use("/api", ...routers);
  app.use("/upload", express.static(path.resolve(__dirname, "../uploads")));

  if (process.env.NODE_ENV === "production") {
    app.use("/content", express.static(path.resolve(__dirname, "./public")));
    app.use("*", (r, res, n) =>
      res.sendFile(path.resolve(__dirname, "./public/index.html"))
    );
  }

  app.use(notFoundHandler, errorHandler);

  server = http.createServer(app);
  server.listen(port, async () => {
    await Promise.all([initDb()]);
    logger.info(`Сервер запущен`, {
      service: "server",
      payload: { port, NODE_ENV: process.env.NODE_ENV },
    });
    isStarted = true;
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
