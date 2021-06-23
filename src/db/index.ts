import path from "path";
import { fillTestDatabase } from "route/test";
import { Sequelize } from "sequelize-typescript";

export const sequelize = new Sequelize({
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
  // modelMatch: (filename, member) =>
  //   filename.substring(0, filename.indexOf(".model")) === member.toLowerCase(),
});

export const init = async () => {
  await sequelize
    .authenticate()
    .catch((err) => console.error("Database connection error: ", err));

  // Disable logging for syncing
  if (process.env.NODE_ENV == "development") {
    // await sequelize.drop();
    await sequelize.sync({ logging: () => {}, force: true });
    await fillTestDatabase();
  }
};
