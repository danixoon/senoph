import { prepareResponse } from "@backend/utils";
import { pool } from "../index";
import { insertObject } from "../utils";

export default {
  create: async (phone: WithoutId<Database.Phone>) =>
    insertObject(pool.request(), "Phone", phone),

  search: async ({}) => {
    const result = await pool.request().query("SELECT * FROM [Phone]");
    return prepareResponse(result.recordset) as ApiResponse.FetchPhones;
  },
};
