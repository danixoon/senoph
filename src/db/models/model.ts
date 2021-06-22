import { prepareResponse } from "@backend/utils";
import { pool } from "../index";
import { insertObject } from "../utils";

export default {
  create: async (model: WithoutId<Database.Model>) =>
    insertObject(pool.request(), "Model", model),

  search: async () => {
    const result = await pool.request().query("SELECT * FROM [Model]");
    return prepareResponse<ApiResponse.Model>(result.recordset);
  },
};
