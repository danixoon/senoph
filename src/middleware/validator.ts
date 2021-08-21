import { ApiError, errorType } from "@backend/utils/errors";
import { RequestHandler } from "express";
import validator from "validator";

type ValidationResult = { message?: string; isValid: boolean };
type RemapValidator<T, S = any> = T extends (str: S, ...args: infer A) => any
  ? (...args: A) => Validator
  : never;

type ValidatorExtensions = {
  test: (value: string, key: string) => ValidationResult;
  message: (str: string) => Validator;
  required: () => Validator;
  array: (schema: ValidationSchema<any>) => Validator;
  isNumber: () => Validator;
};
type Validator = ValidatorExtensions &
  {
    [K in keyof typeof validator]: RemapValidator<typeof validator[K]>;
  };
type ValidationSchema<T> = Record<keyof T, Validator>;
type ValidatorConfig<Q = any, B = any> = {
  query?: ValidationSchema<Q>;
  body?: ValidationSchema<B>;
};

type TesterContext = { property: string };
type Tester = {
  test: (this: TesterContext, value: any) => boolean | string;
  message?: string;
};

export const tester = () => {
  let isRequired: boolean = false;
  const testers: Tester[] = [];
  const extensions: ValidatorExtensions = {
    isNumber: () => {
      testers.push({
        test: function (v) {
          const value = parseInt(v);

          return !isNaN(value)
            ? true
            : `Значение параметра '${this.property}' не является числовым.`;
        },
      });
      return proxy;
    },
    array: (schema) => {
      testers.push({
        test: function (v) {
          if (!Array.isArray(v))
            return `Значение параметра '${this.property}' не является массивом.`;

          if (v.length === 0)
            return `Параметром '${this.property}' был передан пустой массив.`;

          try {
            for (const value of v) {
              validateSchema(schema, value, { target: "query", strict: true });
            }

            return true;
          } catch (err) {
            if (err instanceof ValidationError) {
              return err.message;
            }
            return false;
          }
        },
      });

      return proxy;
    },
    test: (value, key) => {
      const result: ValidationResult = { isValid: true };
      // TODO: Доделать этот валидатор ААА
      if (!isRequired && value === undefined) return result;

      for (const t of testers) {
        const isValid = t.test.call({ property: key }, value) as ReturnType<
          Tester["test"]
        >;
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
      if (typeof target[property] === "undefined")
        return extensions[property as keyof ValidatorExtensions];

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

  for (const key in schema) {
    const validator = schema[key];
    const value = object[key];

    const r = validator.test(value, key);
    if (!r.isValid)
      throw new ValidationError(
        r.message ?? `Неверный параметр '${key}'`,
        config.target
      );
  }
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
    const { query, body } = req;
    try {
      if (config.query)
        validateSchema(config.query, query, { strict, target: "query" });
      if (config.body)
        validateSchema(config.body, body, { strict, target: "body" });

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
