import http from "http";
import path from "path";
import express, { Router } from "express";
import dotenv from "dotenv";
import * as bodyParser from "body-parser";
import { logger } from "@backend/utils/index";
import { logger as logRequest } from "@backend/middleware/logger";

dotenv.config(
  process.env.NODE_ENV === "production" ? { path: path.resolve(__dirname, "../.production.env") } : {}
);

import { init as initDb, close as closeDb } from "@backend/db/index";
import { errorHandler, notFoundHandler } from "@backend/middleware/error";
import { routers } from "./route";

let server: http.Server | null;

export const init = async () => {
  if (server) throw new Error("server already started.");
  const app = express();

  app.use(bodyParser.json());
  app.use(logRequest());

  app.use("/api", ...routers, notFoundHandler, errorHandler);
  app.use("/upload", express.static(path.resolve(__dirname, "../uploads")))

  if (process.env.NODE_ENV === "production") {
    app.use("/content", express.static(path.resolve(__dirname, "./public")));
    app.use("*", (r, res, n) => res.sendFile(path.resolve(__dirname, "./public/index.html")));
  }

  const port = process.env.PORT || 5000;

  server = http.createServer(app);
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
