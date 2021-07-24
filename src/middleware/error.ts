import { ApiError, errorMap, errorType } from "@backend/utils/errors";
import { ErrorRequestHandler } from "express";
import { logger } from "../utils";

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
      error: { ...errorMap[errorType.INTERNAL_ERROR], ...p },
    });
    logger.error(e.message, { service: "api", payload: e });
    next(err);
  }
};
