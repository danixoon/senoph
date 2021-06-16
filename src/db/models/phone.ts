import { pool } from "../index";
import { insertObject, parseResult } from "../utils";

export default {
  create: async (phone: WithoutId<Database.Phone>) =>
    insertObject(pool.request(), "Phone", phone),

  search: async ({}) => {
    const result = await pool.request().query("SELECT * FROM [Phone]");
    return parseResult(result);
  },
};
