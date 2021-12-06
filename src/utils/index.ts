import { NextFunction, Request, Response, RequestHandler } from "express";
import path from "path";
import { inspect } from "util";
import winston from "winston";
import { sequelize } from "../db";

// Deletes empty arrays, strings & null values
export const clearObject = function <T>(obj: T) {
  const filtered = { ...obj };
  for (const k in filtered) {
    const v = filtered[k];
    if (v === undefined) delete filtered[k];
    if (typeof v === "number") if (isNaN(v)) delete filtered[k];
    if (Array.isArray(v) && v.length === 0) delete filtered[k];
    else if (typeof v === "string" && v.trim().length === 0) delete filtered[k];
    else if (v === null) delete filtered[k];
  }

  return filtered as { [K in keyof T]: Exclude<T[K], null | undefined> };
};

export const groupBy = <T, K>(list: T[], getKey: (value: T) => K) => {
  const map = new Map<K, T[]>();
  for (const item of list) {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  }

  return map;
};

export const createEnumProxy = <T extends string>() =>
  new Proxy({} as Readonly<Record<T, T>>, { get: (t, p) => p });

export const logger = winston.createLogger({
  // level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
    }),
  ],
});

const formatter = winston.format.printf(
  ({ level, message, timestamp, metadata }) => {
    return `[${timestamp.split("T")[1].split(".")[0]} ${level} ${
      metadata.service ?? "log"
    }] ${message} ${metadata.payload ? inspect(metadata.payload) : ""}`;
  }
);

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.metadata({
        fillExcept: ["message", "level", "timestamp", "label"],
      }),
      winston.format.colorize(),
      formatter
    ),
  })
);

export const prepareItems: <T>(
  items: T[],
  total: number,
  offset: number
) => ItemsResponse<T> = (items, total, offset) => ({ items, total, offset });

export const handler: <RQ, RS>(
  cb: (req: RQ, res: RS, next: (err?: any) => void) => Promise<any> | any
) => (req: RQ, res: RS, next: (err?: any) => void) => void =
  (cb) => async (req, res, next) => {
    // logger.info((req as any).url, { service: "api" });
    try {
      await cb(req, res, next);
      // next();
    } catch (err) {
      next(err);
    }
  };
export const transactionHandler: <RQ, RS>(
  cb: (req: RQ, res: RS, next: (err?: any) => void) => Promise<any> | any
) => (req: RQ, res: RS, next: (err?: any) => void) => void =
  (cb) => async (req, res: any, next) => {
    //  const trans = await sequelize.transaction();

    // Proxying send function
    const _send = res.send;

    try {
      res.send = async function () {
        //     await trans.commit();
        return _send.bind(this)(...arguments);
      }.bind(res);

      return await cb(req, res, next);
    } catch (err) {
      res.send = _send;
      //   await trans.rollback();
      next(err);
    } finally {
      res.send = _send;
    }
  };
