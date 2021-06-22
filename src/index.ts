import http from "http";
import express from "express";
import dotenv from "dotenv";
import { logger } from "@backend/utils";

dotenv.config();

import { init as initDb } from "db";
import phoneRoute from "./route/phone";
import modelRoute from "./route/model";
import filterRoute from "./route/filter";

const app = express();

app.use("/api/phone", phoneRoute);
app.use("/api/model", modelRoute);
app.use("/api/filter", filterRoute);

const server = http.createServer(app);
const port = Number(process.env.PORT) || 5000;

server.listen(port, async () => {
  await Promise.all([initDb()]);

  logger.info(`server is listening`, { service: "server", payload: { port } });
  // const p = await holder.create({
  //   firstName: "Pupa",
  //   lastName: "Lupov",
  //   middleName: "Lupovich",
  // });

  // const p = await model.create({
  //   accountingDate: new Date(),
  //   name: "owo",
  // });

  // console.log(p);
});

server.on("error", (err) => {
  console.log(err);
});
