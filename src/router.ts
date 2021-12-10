import { IRouter, RequestHandler, Router } from "express";

export const AppRouter = () => {
  return Router() as any as Api.Router;
};
