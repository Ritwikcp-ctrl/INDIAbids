import type { Request, Response, NextFunction } from "express";

import { env } from "../config/env";
import { AppError } from "../lib/app-error";

export function requireSameOrigin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const origin = req.get("origin");

  if (!origin) {
    next();
    return;
  }

  if (origin !== env.CORS_ORIGIN) {
    next(new AppError(403, "INVALID_ORIGIN", "Request origin is not allowed."));
    return;
  }
  next();
}
