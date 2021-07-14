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
  test: (this: TesterContext, str: string) => boolean | string;
  message?: string;
};

export const tester = () => {
  const testers: Tester[] = [];
  const extensions: ValidatorExtensions = {
    test: (value, key) => {
      const result: ValidationResult = { isValid: true };
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
            (v == null && `Value ${prop ? `'${prop}' ` : ""}required`) || true
          );
        },
      });
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

export class ValidationError extends Error {
  constructor(msg: string = "Validaton Error") {
    super(msg);
  }
}

export const validateSchema = <T>(schema: ValidationSchema<T>, object: any) => {
  for (const key in schema) {
    const validator = schema[key];
    const value = object[key];

    const r = validator.test(value, key);
    if (!r.isValid) throw new ValidationError(r.message);
  }
};

export const validate: <Q = any, B = any>(
  config: ValidatorConfig<Q, B>
) => (req: { query: Q }, res: any, next: (err?: any) => void) => void =
  (config) => (req, res, next) => {
    const query = req.query as any;
    try {
      if (config.query) {
        validateSchema(config.query, query);
      }
      next();
    } catch (err) {
      if (err instanceof ValidationError) next(err.message);
      else throw err;
    }
  };
