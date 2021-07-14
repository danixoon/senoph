import { RequestHandler } from "express";

type ConverterConfig<T> = {
  [P in keyof T]: (converter: Converter) => any;
};

export class Converter {
  value: any;
  constructor(value: any) {
    this.value = value;
  }
  toArray = () => {
    return new ArrayConverter(this.value.toString().split(","));
  };
}

export class ArrayConverter {
  value: any[];
  constructor(value: any[]) {
    this.value = value;
  }
  toNumbers = (isFloat: boolean) => {
    this.value = this.value.map((v) =>
      isFloat ? Number.parseFloat(v) : Number.parseInt(v)
    );
    return this;
  };
}

export const convertValues: <T>(
  config: ConverterConfig<T>
) => (req: { query: any }, res: any, next: (err?: any) => void) => void =
  (config) => (req, res, next) => {
    const result = { ...(req.query as any) };
    for (const k in config)
      result[k] =
        typeof result[k] !== "undefined"
          ? config[k](new Converter(result[k]))
          : result[k];

    req.query = result;
    next();
  };
