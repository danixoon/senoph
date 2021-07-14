import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { ApiError, ErrorType } from "@backend/route/errors";

const priority: Record<Role, number> = {
  admin: 2,
  user: 1,
  unknown: 0,
};

export const access: <R extends Role>(
  requiredRole: R
) => RequestHandler<{
  user: R extends "unknown" ? { role: R } : { id: number; role: Role };
}> = (requiredRole) => (req, res, next) => {
  const token = req.header("Authorization");
  if (requiredRole === "unknown") {
    req.params.user = { role: "unknown" } as any;
    next();
    return;
  }
  if (!token)
    return next(
      new ApiError(ErrorType.ACCESS_DENIED, "Необходим ключ доступа")
    );

  try {
    const { id, role } = jwt.verify(token, process.env.SECRET) as any;
    if (priority[requiredRole] > priority[role as Role] ?? 0)
      return next(new ApiError(ErrorType.ACCESS_DENIED, "Недостаточно прав"));

    req.params.user = { id, role } as any;
    next();
  } catch (err) {
    next(new ApiError(ErrorType.ACCESS_DENIED, "Некорректный ключ доступа"));
    // res.status(403).send("Access denied: invalid credentials");
  }
};
