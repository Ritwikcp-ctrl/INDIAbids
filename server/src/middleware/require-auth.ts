import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/app-error.js";
import { attachUser } from "./attach-user.js";

/**
 * requireAuth — strict gate for /dashboard, /businesses/mine, /manage/:token/claim.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.auth) {
    return next();
  }

  await attachUser(req, res, (err) => {
    if (err) return next(err);
    if (!req.auth) {
      return next(
        new AppError(
          401,
          "AUTHENTICATION_REQUIRED",
          "Authentication is required."
        )
      );
    }
    next();
  });
}
