import { pool } from "../index";
import { insertObject, parseResult } from "../utils";

export default {
  create: async (model: WithoutId<Database.Model>) =>
    insertObject(pool.request(), "Model", model),

  search: async ({}) => {
    const result = await pool.request().query("SELECT * FROM [Model]");
    return parseResult(result);
  },
};
