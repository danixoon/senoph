import jwt from "jsonwebtoken";
import { RequestHandler } from "express";

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
  if (!token) return res.status(403).send("Access denied: token required");

  try {
    const { id, role } = jwt.verify(token, process.env.SECRET) as any;
    if (priority[requiredRole] > priority[role as Role] ?? 0)
      return res.status(403).send("Access denied: invalid privileges");

    req.params.user = { id, role } as any;
    next();
  } catch (err) {
    res.status(403).send("Access denied: invalid credentials");
  }
};
