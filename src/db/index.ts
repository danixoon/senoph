import * as mssql from "mssql";

export const pool = new mssql.ConnectionPool({
  server: process.env.DB_HOST as string,
  port: Number.parseInt(process.env.DB_PORT as string),
  user: process.env.DB_USERNAME as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  options: {
    encrypt: false
  }
});

export const init = () => {
  return pool.connect();
};
