import { Router } from "express";

import department from "@backend/db/models/department";
import phone from "@backend/db/models/phone";
import model from "@backend/db/models/model";

const router = Router();

router.get("/", async (req, res) => {
  const [departments, types, models] = await Promise.all([
    department.search(),
    phone.getTypes(),
    model.search(),
  ]);

  const response: ApiResponse.FetchFilterConfig = {
    departments: departments.items,
    types: types.items,
    models: models.items.map((item) => ({
      id: item.id,
      name: item.name,
      phoneTypeId: item.phoneTypeId,
    })),
  };

  res.send(response);
});

export default router;
