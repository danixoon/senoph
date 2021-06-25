import { Router } from "express";

// import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone.model";
import model from "@backend/db/models/phoneModel.model";
import PhoneType from "@backend/db/models/phoneType.model";
import Department from "@backend/db/models/department.model";
import PhoneModel from "@backend/db/models/phoneModel.model";

const router = Router();

router.get("/", async (req, res) => {
  const [departments, types, models] = await Promise.all([
    Department.scope("names").findAll(),
    PhoneType.scope("names").findAll(),
    PhoneModel.scope("names").findAll(),
  ]);

  const response: ApiResponse.FetchFilterConfig = {
    departments: departments as ApiResponse.Department[],
    types: types as ApiResponse.PhoneType[],
    models: models as ApiResponse.PhoneModel[],
  };
  res.send(response);
});

export default router;
