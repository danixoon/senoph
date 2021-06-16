import { pool } from "../index";
import { insertObject, parseResult } from "../utils";

export default {
  create: async (holder: WithoutId<Database.Holder>) =>
    insertObject(pool.request(), "Holder", holder),

  search: async ({}) => {
    const result = await pool.request().query("SELECT * FROM [Phone]");
    return parseResult(result);
  },
};
