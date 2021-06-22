import { prepareResponse } from "@backend/utils";
import { pool } from "../index";
import { insertObject } from "../utils";

export default {
  create: async (phone: WithoutId<Database.Phone>) =>
    insertObject(pool.request(), "Phone", phone),

  search: async (filter: ApiRequest.FetchPhones) => {
    const req = pool.request();
    const cond = {
      category:
        "@category = (SELECT TOP 1 [category] FROM [PhoneCategory] WHERE [phoneId] = p.[id] ORDER BY [date] DESC)",
      modelId: "@modelId = p.[modelId]",
      phoneTypeId: `@phoneTypeId IN (SELECT [phoneTypeId] FROM [Model] m WHERE p.[modelId] = m.[id] ${
        filter.modelId ? "AND m.[id] = @modelId" : ""
      })`,
    };

    let activeCond = [];
    for (const k in cond) {
      const value = (filter as any)[k];
      if (typeof value !== "undefined") {
        activeCond.push((cond as any)[k]);
        req.input(k, value);
      }
    }

    const query = `SELECT * FROM [Phone] p ${
      activeCond.length > 0 ? ` WHERE ${activeCond.join(" AND ")}` : ""
    }`;

    const result = await req.query(query);

    return prepareResponse(result.recordset) as ApiResponse.FetchPhones;
  },

  getTypes: async () => {
    const result = await pool.request().query("SELECT * FROM [PhoneType]");
    return prepareResponse<ApiResponse.PhoneType>(result.recordset);
  },
};
