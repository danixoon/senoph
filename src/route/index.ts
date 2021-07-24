import { Router } from "express";

import phoneRoute from "@backend/route/phone";
import filterRoute from "@backend/route/filter";
import commitRoute from "@backend/route/commit";
import accountRoute from "@backend/route/account";

export const routers: Router[] = [
  phoneRoute as Router,
  filterRoute as Router,
  commitRoute as Router,
  accountRoute as Router,
];
