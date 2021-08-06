import { ApiError, errorType } from "@backend/utils/errors";
import { RequestHandler } from "express";
import validator from "validator";
import { logger as loggerUtil } from "../utils";

export const logger: <P>() => Api.Request<P, any, any, any> =
  () => (req, res, next) => {
    loggerUtil.info(`${req.method.toUpperCase()} ${req.url}`, {
      service: "api",
    });
    next();
  };
