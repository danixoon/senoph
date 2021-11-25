import { ApiError, errorType } from "@backend/utils/errors";
import { RequestHandler } from "express";
import validator from "validator";

type ValidationResult = { message?: string; isValid: boolean; value: any };
type RemapValidator<T, S = any> = T extends (str: S, ...args: infer A) => any
  ? (...args: A) => Validator
  : never;

type ValidatorExtensions = {
  test: (
    value: string,
    key: string,
    target: ValidationTarget
  ) => ValidationResult;
  message: (str: string) => Validator;
  required: () => Validator;
  array: (
    schema?: ValidationSchema<any> | "int" | "float",
    noEmpty?: boolean
  ) => Validator;
  isNumber: () => Validator;
  isBoolean: () => Validator;
  isDate: () => Validator;
};
export type Validator = ValidatorExtensions & {
  [K in keyof typeof validator]: RemapValidator<typeof validator[K]>;
};
type ValidationSchema<T> = Record<keyof T, Validator>;
type ValidatorConfig<Q = any, B = any> = {
  query?: ValidationSchema<Q>;
  body?: ValidationSchema<B>;
};

type TesterContext = { property: string; target: ValidationTarget };
type Tester = {
  mapper?: (this: TesterContext, value: string) => any;
  test: (this: TesterContext, value: any) => boolean | string;
  message?: string;
};

export const tester = () => {
  let isRequired: boolean = false;
  const testers: Tester[] = [];
  const extensions: ValidatorExtensions = {
    isDate: () => {
      testers.push({
        mapper: function (v) {
          try {
            const date = new Date(v);
            return isNaN(date.getTime()) ? null : date;
          } catch (err) {
            return null;
          }
        },
        test: function (v) {
          return v === null
            ? `Некорректная дата передана парамтером '${this.property}'`
            : true;
        },
      });

      return proxy;
    },
    isBoolean: () => {
      testers.push({
        mapper: function (v) {
          return v === "true" ? true : v === "false" ? false : null;
        },
        test: function (v) {
          return v === null
            ? `Значение параметра '${this.property}' может быть либо 'true' либо 'false'`
            : true;
        },
      });

      return proxy;
    },
    isNumber: () => {
      testers.push({
        mapper: function (v) {
          return parseInt(v);
        },
        test: function (v) {
          return !isNaN(v)
            ? true
            : `Значение параметра '${this.property}' не является числовым.`;
        },
      });
      return proxy;
    },
    array: (schema, noEmpty) => {
      testers.push({
        test: function (v) {
          if (!Array.isArray(v))
            return `Значение параметра '${this.property}' не является массивом.`;

          if (noEmpty && v.length === 0)
            return `Параметром '${this.property}' был передан пустой массив.`;

          if (!schema) return true;

          try {
            if (typeof schema === "string") {
              for (const value of v) {
                if (isNaN(value))
                  return schema === "float"
                    ? `В массиве '${this.property}' поддерживаются только числовые значения`
                    : `В массиве '${this.property}' поддерживаются только целочисленные значения`;
              }
            } else
              for (const value of v) {
                validateSchema(schema, value, {
                  target: "query",
                  strict: true,
                });
              }

            return true;
          } catch (err) {
            if (err instanceof ValidationError) {
              return err.message;
            }
            return false;
          }
        },
        mapper: function (v) {
          if (Array.isArray(v)) return v;

          const value = v.toString() as string;
          const values = value.split(",");
          return typeof schema === "string"
            ? values.map((value) =>
                schema === "float" ? parseFloat(value) : parseInt(value)
              )
            : values;
        },
      });

      return proxy;
    },
    test: (value, key, target) => {
      const result: ValidationResult = { isValid: true, value };
      // TODO: Доделать этот валидатор ААА
      if (!isRequired && value === undefined) return result;

      for (const t of testers) {
        const self = { property: key, target };
        // TODO: Make mapper error handling
        const mappedValue = !t.mapper
          ? result.value
          : t.mapper.call(self, result.value);
        const isValid = t.test.call(self, mappedValue) as ReturnType<
          Tester["test"]
        >;

        result.value = mappedValue;

        if (typeof isValid === "string" || !isValid) {
          result.isValid = false;
          result.message =
            typeof isValid === "string" ? t.message ?? isValid : t.message;
          break;
        }
      }
      return result;
    },
    message: (msg: string) => {
      testers[testers.length - 1].message = msg;
      return proxy;
    },
    required: () => {
      testers.push({
        test: function (v) {
          const prop = this?.property;
          return (
            (v == null && `Параметр ${prop ? `'${prop}' ` : ""}обязателен`) ||
            true
          );
        },
      });
      isRequired = true;
      return proxy;
    },
  };
  const proxy = new Proxy(validator as any, {
    get: (target, property) => {
      if (
        typeof extensions[property as keyof ValidatorExtensions] === "undefined"
      )
        // if (typeof target[property] === "undefined")
        return (...args: any[]) => {
          testers.push({
            test: (v: string) => {
              if (v === undefined) return !isRequired;

              const isValid = target[property](v, ...args);

              return isValid;
            },
          });

          return proxy;
        };
      else return extensions[property as keyof ValidatorExtensions];
    },
  }) as Validator;

  return proxy;
};

type ValidationTarget = "query" | "body";

export class ValidationError extends Error {
  target: ValidationTarget;
  constructor(msg: string = "Validaton Error", type: ValidationTarget) {
    super(msg);
    this.target = type;
  }
}

export const validateSchema = <T>(
  schema: ValidationSchema<T>,
  object: any,
  config: { strict?: boolean; target: ValidationTarget }
) => {
  if (config.strict) {
    const objectKeys = Object.keys(object);

    for (const k in schema) {
      // НЕ нужно, ибо метод required выполняет эту функцию
      // if (!objectKeys.includes(k))
      // throw new ValidationError(`Параметр '${k}' обязателен.`, config.target);
      objectKeys.splice(objectKeys.indexOf(k), 1);
    }

    if (objectKeys.length > 0)
      throw new ValidationError(
        `Неизвестный параметр '${objectKeys[0]}'.`,
        config.target
      );
  }

  const validatedObject = { ...object };

  for (const key in schema) {
    const validator = schema[key];
    const value = object[key];

    // const mapper = validator.
    // let r: ValidationResult;
    // try {
    const r = validator.test(value, key, config.target);
    // } catch (err) {
    //   r = {
    //     isValid: false,
    //     value,
    //     message: `Ошибка валидации параметра '${key}'`,
    //   };
    // }

    if (!r.isValid)
      throw new ValidationError(
        r.message ?? `Неверный параметр '${key}'`,
        config.target
      );

    validatedObject[key] = r.value;
  }

  return validatedObject;
};

export const validate: <P, Q, B, CQ extends Q, CB extends B>(
  config: ValidatorConfig<
    Record<keyof CQ, Validator>,
    Record<keyof CB, Validator>
  >,
  strict?: boolean
) => Api.Request<P, any, Q, B> =
  (config, strict = true) =>
  (req, res, next) => {
    let { query, body } = req;
    try {
      if (config.query)
        query = validateSchema(config.query, query, {
          strict,
          target: "query",
        });
      if (config.body)
        body = validateSchema(config.body, body, { strict, target: "body" });

      req.query = query;
      req.body = body;

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        const e = err as ValidationError;
        next(
          new ApiError(
            e.target === "query"
              ? errorType.INVALID_QUERY
              : errorType.INVALID_BODY,
            { description: err.message }
          )
        );
      } else throw err;
    }
  };
