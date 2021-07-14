import http from "http";
import express, { Router } from "express";
import dotenv from "dotenv";
import * as bodyParser from "body-parser";
import { logger } from "@backend/utils";

dotenv.config();

import { init as initDb, close as closeDb } from "@backend/db/index";
import phoneRoute from "./route/phone";
import modelRoute from "./route/model";
import filterRoute from "./route/filter";
import commitRoute from "./route/commit";
import accountRoute from "./route/account";
import testRoute from "./route/_test";
import path from "path";

import { errorHandler } from "@backend/route/errors";

// let app: express.Application;
let server: http.Server | null;

export const init = async () => {
  if (server) throw new Error("server already started.");
  const app = express();

  app.use(bodyParser.json());
  app.use("/api/phone", phoneRoute);
  app.use("/api/model", modelRoute);
  app.use("/api/filter", filterRoute);
  app.use("/api", commitRoute as Router, accountRoute as Router);
  app.use("/api/test", testRoute);

  app.use("/build", express.static(path.resolve(__dirname, "../client/build")));
  app.use("*", express.static(path.resolve(__dirname, "../client/build")));

  app.use(errorHandler);

  server = http.createServer(app);

  const port = Number(process.env.PORT) || 5000;

  server.listen(port, async () => {
    await Promise.all([initDb()]);
    logger.info(`server is listening`, {
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
