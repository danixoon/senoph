import path from "path";
import { promises as fs } from "fs";
import { fillDevDatabase, fillProdDatabase } from "@backend/utils/db";
import { Sequelize } from "sequelize-typescript";
import { logger } from "@backend/utils/index";

let sequelize: Sequelize;
let dbLogger: fs.FileHandle;

export const getModel = (name: string) => sequelize.models[name];

export const init = async () => {
  // console.log(process.env);
  dbLogger = await fs.open(path.resolve(__dirname, "../../logs/db.log"), "a+");
  sequelize = new Sequelize({
    dialect: process.env.DB_DIALECT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT),

    models: [
      path.resolve(
        __dirname,
        `./models/*.model.${process.env.NODE_ENV === "production" ? "js" : "ts"
        }`
      ),
    ],
    dialectOptions:
      process.env.DB_DIALECT === "mssql"
        ? {
          options: {
            encrypt: false,
          },
        }
        : {},

    logging: (sql) => {
      const t = new Date();
      const log = `[${t.toLocaleDateString()} ${t.toLocaleTimeString()}] ${sql}\n`;
      dbLogger.write(log);
    },
    // modelMatch: (filename, member) =>
    //   filename.substring(0, filename.indexOf(".model")) === member.toLowerCase(),
  });

  try {
    await sequelize.authenticate();
  } catch (err) {
    logger.error(`Ошибка подключения к базе данных: ${err.message}`, {
      service: "db",
      payload: err,
    });
    throw err;
    // return close();
  }

  const isProd = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test";

  if (!isTest) {
    if (!isProd)
      await sequelize.drop({});
    await sequelize.sync({
      logging: (sql) => {
        const t = new Date();
        const log = `[${t.toLocaleDateString()} ${t.toLocaleTimeString()} | sync] ${sql}\n`;
        dbLogger.write(log);
      }, force: !isProd
    });

    if (isProd) await fillProdDatabase();
    else await fillDevDatabase();
  }
};

export const close = async () => {
  await sequelize.close();
  await logger.close();
};
