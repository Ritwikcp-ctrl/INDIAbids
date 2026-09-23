import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodError } from "zod";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.flatten(),
      },
    });

    return;
  }

  logger.error(
    {
      err: error,
      method: req.method,
      path: req.originalUrl,
      requestId: res.locals.requestId,
    },
    "Unhandled request error"
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occured",
    },
  });
};
