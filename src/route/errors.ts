import { ErrorRequestHandler } from "express";
import { logger } from "../utils";

type ApiErrorConfig = {
  message: string;
  code: number;

  description?: string;
  payload?: any;
};
type ErrorTypeMap = { [T in ErrorType]: ApiErrorConfig };

export enum ErrorType {
  ACCESS_DENIED = "ACCESS_DENIED",
  INVALID_QUERY = "INVALID_QUERY",
  INVALID_BODY = "INVALID_BODY",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export const errorMap: ErrorTypeMap = {
  [ErrorType.INTERNAL_ERROR]: {
    code: 500,
    message: "Внутренняя ошибка",
  },
  [ErrorType.ACCESS_DENIED]: {
    code: 403,
    message: "Доступ запрещён",
  },
  [ErrorType.INVALID_QUERY]: {
    code: 400,
    message: "Некорректные параметры запроса",
  },
  [ErrorType.INVALID_BODY]: {
    code: 400,
    message: "Некорректное тело запроса",
  },
};

export class ApiError extends Error {
  payload: ApiErrorConfig & { name: ErrorType };
  constructor(
    type: ErrorType,
    info: { description?: string; payload?: any } = {}
  ) {
    const { description, payload } = info;
    const errorName = `${type}`;
    super(description ? `${errorName}: ${description}` : errorName);

    this.payload = { ...errorMap[type], name: type, description, payload };
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    const e = err as ApiError;
    res.status(e.payload.code).send({ error: { ...e.payload } });
    logger.error(e.message, {
      service: "api",
    });
  } else {
    const e = err as Error;
    const p = process.env.NODE_ENV !== "production" ? { payload: e } : {};
    res.status(500).send({
      error: { ...errorMap[ErrorType.INTERNAL_ERROR], ...p },
    });
    logger.error(e.message, { service: "api", payload: e });
    next(err);
  }
};
