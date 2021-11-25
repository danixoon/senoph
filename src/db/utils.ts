import { IResult, Request } from "mssql";
import { groupBy } from "../utils";

/// Parsing result of mssql query

export const insertObject = (req: Request, table: string, object: any) => {
  const keys = Object.keys(object);
  for (const key of keys) req = req.input(key, object[key]);

  const q = `INSERT INTO [${table}] ([${keys.join("], [")}]) VALUES (${keys
    .map((k) => `@${k}`)
    .join(", ")})`;

  // console.log(q);

  return req.query(q);

  // return req.query(
  //   `INSERT INTO [${table}] (firstName, secondName, middleName) VALUES (@firstName, @secondName, @middleName)`
  // );
};

export const getValues = (entries: [string, any][]) =>
  entries.map(([key]) => `@${key}`).join(", ");

export const modelsToMap = <T extends { id?: any }>(list: T[]) =>
  groupBy(list, (v) => {
    if (v == null) throw new Error("ID is null");
    return v.id;
  });
