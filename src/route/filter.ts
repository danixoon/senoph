import { Router } from "express";

// import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone.model";
import model from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import Department from "@backend/db/models/department.model";
import PhoneModel from "@backend/db/models/phoneModel.model";
import { AppRouter } from "../router";

const router = AppRouter();

router.get("/filter", async (req, res) => {
  const [departments, types, models] = await Promise.all([
    Department.scope("names").findAll(),
    PhoneType.scope("names").findAll(),
    PhoneModel.scope("names").findAll(),
  ]);

  const response = {
    departments: departments as Api.Models.Department[],
    types: types as Api.Models.PhoneType[],
    models: models as Api.Models.PhoneModel[],
  };
  res.send(response);
});

export default router;
