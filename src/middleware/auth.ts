import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { ApiError, errorType } from "@backend/utils/errors";
import { getModel } from "../db";

const priority: Record<Role, number> = {
  admin: 2,
  user: 1,
  unknown: 0,
};

type Arg<T> = T extends (reg: infer R, ...args: any[]) => any ? R : never;
export type WithUser<R extends Role> = {
  user: R extends "unknown" ? { role: R } : { id: number; role: Role };
};
export type WithOwner<P extends keyof Api.ModelMap> = Record<
  P,
  Api.ModelMap[P]
>;

export const owner: <RB, Q, B, T extends keyof Api.ModelMap, P = any>(
  target: T,
  reqFn: (q: Arg<Api.Request<P, RB, Q, B>>) => number,
  testFn?: (model: Api.ModelMap[T]) => any | Promise<any>
) => Api.Request<P, RB, Q, B> =
  (target, reqFn, testFn) => async (req, res, next) => {
    const { user } = req.params as any;
    const model = getModel(
      target[0].toUpperCase() + target.toLowerCase().substr(1)
    );
    const id = reqFn(req);

    const table = await model.findByPk(id, { raw: true });

    if (!table)
      return next(
        new ApiError(errorType.NOT_FOUND, {
          description: `Не найден объект #${id}`,
        })
      );

    if ((table as any).authorId?.toString() !== user.id.toString())
      return next(
        new ApiError(errorType.ACCESS_DENIED, {
          description: "Доступ ограничен",
        })
      );

    try {
      if (testFn) await testFn(table as any);
    } catch (err) {
      return next(err);
    }

    next();
  };

export const access: <R extends Role>(
  requiredRole: R,
  strict?: boolean
) => Api.Request<WithUser<R>> = (requiredRole, strict) => (req, res, next) => {
  const token = req.header("Authorization");
  if (!strict && requiredRole === "unknown") {
    req.params.user = { role: "unknown" } as any;
    next();
    return;
  }

  if (!token)
    return next(
      new ApiError(errorType.ACCESS_DENIED, {
        description: "Необходим ключ доступа",
      })
    );

  try {
    const { id, role } = jwt.verify(token, process.env.SECRET) as any;
    // Если строгий режим и роли совпадают

    if (
      ((strict && role !== requiredRole) ||
        priority[requiredRole] > priority[role as Role]) ??
      0
    )
      return next(
        new ApiError(errorType.ACCESS_DENIED, {
          description: "Недостаточно прав",
        })
      );

    req.params.user = { id, role } as any;
    next();
  } catch (err) {
    next(
      new ApiError(errorType.ACCESS_DENIED, {
        description: "Некорректный ключ доступа",
      })
    );
    // res.status(403).send("Access denied: invalid credentials");
  }
};

export function withUser(params: any): params is WithUser<Role> {
  return params.user !== undefined;
}
export function withOwner<K extends keyof Api.ModelMap>(
  params: any,
  key: K
): params is WithOwner<K> {
  return params[key] !== undefined;
}

// export function withParams(
//   ...params: (<T>(a: T, ...args: any[]) => a is T)[]
// ) {}
