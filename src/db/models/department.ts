import { pool } from "../index";
import { insertObject, parseResult } from "../utils";

export default {
  create: async (department: WithoutId<Database.Department>) =>
    insertObject(pool.request(), "Department", department),

  search: async ({}) => {
    const result = await pool.request().query("SELECT * FROM [Department]");
    return parseResult(result);
  },
};
