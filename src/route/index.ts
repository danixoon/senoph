import { Router } from "express";

import phoneRoute from "@backend/route/phone";
import commitRoute from "@backend/route/commit";
import accountRoute from "@backend/route/account";
import holderRoute from "@backend/route/holder";
import phoneModelRoute from "@backend/route/model";
import holdingRoute from "@backend/route/holding";
import categoryRoute from "@backend/route/category";
import departmentRoute from "@backend/route/department";
import logRoute from "@backend/route/log";

export const routers: Router[] = [
  phoneRoute as Router,
  commitRoute as Router,
  accountRoute as Router,
  phoneModelRoute as Router,
  holderRoute as Router,
  holdingRoute as Router,
  categoryRoute as Router,
  departmentRoute as Router,
  logRoute as Router,
];
