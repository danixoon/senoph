import { IResult, Request } from "mssql";

/// Parsing result of mssql query
export const parseResult = <T>(result: IResult<T>): IResult<T> => {
  const convertItem = (item: any) => {
    const converted = { ...item };
    for (let key in converted)
      if (key.endsWith("Date")) converted[key] = new Date(converted[key]);

    return converted;
  };

  if (Array.isArray(result.output))
    return { ...result, output: result.output.map(convertItem) };
  else return { ...result, output: convertItem(result.output) };
};

export const insertObject = (req: Request, table: string, object: any) => {
  const keys = Object.keys(object);
  for (const key of keys) req = req.input(key, object[key]);

  const q = `INSERT INTO [${table}] ([${keys.join("], [")}]) VALUES (${keys
    .map((k) => `@${k}`)
    .join(", ")})`;

  console.log(q);

  return req.query(q);

  // return req.query(
  //   `INSERT INTO [${table}] (firstName, secondName, middleName) VALUES (@firstName, @secondName, @middleName)`
  // );
};

export const getValues = (entries: [string, any][]) =>
  entries.map(([key]) => `@${key}`).join(", ");
