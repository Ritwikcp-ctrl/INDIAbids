import type { Request, Response, NextFunction } from "express";

import { AppError } from "../lib/app-error";
import type { AuthRole } from "../modules/auth/auth.types";

export function requireRole(...allowedRoles: AuthRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(
        new AppError(
          401,
          "AUTHENTICATION_REQUIRED",
          "Authentication is required."
        )
      );
      return;
    }
    if (!allowedRoles.includes(req.auth.role)) {
      next(
        new AppError(
          403,
          "FORBIDDEN",
          "You are not authorized to perform this action."
        )
      );
      return;
    }
    next();
  };
}
