import { Router } from "express";

import phoneRoute from "@backend/route/phone";
import commitRoute from "@backend/route/commit";
import accountRoute from "@backend/route/account";
import holderRoute from "@backend/route/holder";
import holdingRoute from "@backend/route/holding";
import categoryRoute from "@backend/route/category";
import departmentRoute from "@backend/route/department";
import placementRoute from "@backend/route/placement";
import logRoute from "@backend/route/log";
import importRoute from "@backend/route/import";

export const routers: Router[] = [
  importRoute as Router,
  phoneRoute as Router,
  commitRoute as Router,
  accountRoute as Router,
  holderRoute as Router,
  holdingRoute as Router,
  categoryRoute as Router,
  departmentRoute as Router,
  placementRoute as Router,
  logRoute as Router,
];
