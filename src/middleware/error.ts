import { ApiError, errorMap, errorType } from "@backend/utils/errors";
import { ErrorRequestHandler, RequestHandler } from "express";
import { handler, logger } from "../utils";


export const notFoundHandler: RequestHandler = handler((req, res, next) => {
  throw new ApiError(errorType.NOT_FOUND, { description: "Страница не найдена." });
})
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    const e = err as ApiError;
    res.status(e.payload.code).send({ error: { ...e.payload } });
    logger.error(e.message, {
      service: "api",
      payload: { url: req.url },
    });
  } else {
    const e = err as Error;
    const p = process.env.NODE_ENV !== "production" ? { payload: e } : {};
    res.status(500).send({
      error: { ...errorMap[errorType.INTERNAL_ERROR], name: "INTERNAL_ERROR", ...p },
    });
    logger.error(e.message, {
      service: "api",
      payload: { ...e, url: req.url },
    });
    // next(err);
  }
};
