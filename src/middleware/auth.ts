import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { ApiError, errorType } from "@backend/utils/errors";

const priority: Record<Role, number> = {
  admin: 2,
  user: 1,
  unknown: 0,
};

export const access: <R extends Role>(
  requiredRole: R,
  strict?: boolean
) => Api.Request<{
  user: R extends "unknown" ? { role: R } : { id: number; role: Role };
}> = (requiredRole, strict) => (req, res, next) => {
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
