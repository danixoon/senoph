import path from "path";
import { promises as fs, existsSync } from "fs";
import minimist from "minimist";
import { fillDevDatabase, fillProdDatabase } from "@backend/utils/db";
import { Sequelize } from "sequelize-typescript";
import { logger } from "@backend/utils/index";

export let sequelize: Sequelize;
let dbLogger: fs.FileHandle;

type SyncConfig = {
  date: Date;
  error: null | any;
};

export const getModel = (name: string) => sequelize.models[name];

const configFilename = path.resolve(__dirname, "../../sync.json");
export const getSyncConfig = async () => {
  if (!existsSync(configFilename)) return null;
  try {
    const file = await fs.readFile(configFilename, { encoding: "utf8" });
    const sync = JSON.parse(file);
    const config: SyncConfig = {
      date: new Date(sync.date),
      error: sync.error || null,
    };
    return config;
  } catch (err) {
    throw new Error(
      "Некорректная конфигурация sync.json. Попробуйте удалить его и перезапустить сервер."
    );
  }
};

export const dropDatabase = () => {
  logger.info(`База данных очищается`, {
    service: "database",
  });
  return sequelize.drop({});
};
export const syncDatabase = async (force: boolean) => {
  logger.info(
    `База данных синхронизируется${force ? " БЕЗ СОХРАНЕНИЯ ИЗМЕНЕНИЙ" : ""}`,
    {
      service: "database",
    }
  );
  const now = new Date();
  const config: SyncConfig = {
    date: now,
    error: null,
  };
  try {
    await sequelize.sync({
      logging: (sql) => {
        const t = new Date();
        const log = `[${t.toLocaleDateString()} ${t.toLocaleTimeString()} | sync] ${sql}\n`;
        dbLogger.write(log);
      },
      force,
    });
    return config;
  } catch (err) {
    config.error = err;
    throw err;
  } finally {
    const json = JSON.stringify(config);
    await fs.writeFile(configFilename, json);
  }
};

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
        `./models/*.model.${
          process.env.NODE_ENV === "production" ? "js" : "ts"
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
  const isFill = process.env.DEV_DB_FILL === "true";
  const isDrop = process.env.DEV_DB_DROP === "true";
  const { sync, force } = minimist(process.argv.slice(2));

  if (!isTest) {
    if (!isProd && isDrop) await dropDatabase();
    if (!isProd && isFill) await syncDatabase(true);
    else if (sync) {
      const config = await getSyncConfig();
      if (!config || force) {
        await dropDatabase();
        await syncDatabase(true);
      } else
        throw new Error(
          `Невозможно произвести синхронизацию: она уже производилась ${config.date.toLocaleDateString()} в ${config.date.toLocaleTimeString()}. Удалите файл sync.json, либо запустите приложение с флагом --force чтобы сделать её повторно без сохранения изменений.`
        );
    } else syncDatabase(false);

    // 1141 <-> 1481
    if (isProd) await fillProdDatabase();
    else await fillDevDatabase(isFill, 500);
  }

  const backupDirPath = path.resolve(__dirname, "../../backup");
  if (!existsSync(backupDirPath)) await fs.mkdir(backupDirPath);
};

export const close = async () => {
  await sequelize.close();
  await logger.close();
};
