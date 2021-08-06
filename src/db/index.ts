import path from "path";
import fs from "fs/promises";
import { fillTestDatabase } from "@backend/utils/db";
import { Sequelize } from "sequelize-typescript";
import { logger } from "@backend/utils/index";

let sequelize: Sequelize;
let dbLogger: fs.FileHandle;

export const getModel = (name: string) => 
sequelize.models[name];

export const init = async () => {
  // console.log(process.env);
  dbLogger = await fs.open("./db.log", "a+");
  sequelize = new Sequelize({
    dialect: "mssql",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT),

    models: [path.resolve(__dirname, "./models/*.model.ts")],
    dialectOptions: {
      options: {
        encrypt: false,
      },
    },

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

  // Disable logging for syncing
  if (process.env.NODE_ENV !== "test") {
    // await sequelize.drop();
    await sequelize.sync({ logging: () => {}, force: true });
    await fillTestDatabase();
  }
};

export const close = async () => {
  await sequelize.close();
  await logger.close();
};
