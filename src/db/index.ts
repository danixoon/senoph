import path from "path";
import fs from "fs/promises";
import { fillTestDatabase } from "@backend/route/_test";
import { Sequelize } from "sequelize-typescript";

let sequelize: Sequelize;
let logger: fs.FileHandle;

export const init = async () => {
  // console.log(process.env);
  logger = await fs.open("./db.log", "a+");
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
      logger.write(log);
    },
    // modelMatch: (filename, member) =>
    //   filename.substring(0, filename.indexOf(".model")) === member.toLowerCase(),
  });

  const result = await sequelize
    .authenticate()
    .catch((err) => console.error("Database connection error: ", err)) as any;

  if (!result) return;

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
