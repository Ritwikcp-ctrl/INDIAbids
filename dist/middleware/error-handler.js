import { ZodError } from "zod";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { AppError } from "../lib/app-error";
export const errorHandler = (error, req, res, _next) => {
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
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                ...(error.details !== undefined
                    ? { details: error.details }
                    : {}),
            },
        });
        return;
    }
    logger.error({
        err: error,
        method: req.method,
        path: req.originalUrl,
        requestId: res.locals.requestId,
    }, "Unhandled request error");
    const developmentError = env.NODE_ENV !== "production" &&
        error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
        }
        : undefined;
    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: env.NODE_ENV !== "production"
                ? developmentError?.message ??
                    "An unexpected error occurred."
                : "An unexpected error occurred.",
            ...(env.NODE_ENV !== "production" &&
                developmentError
                ? {
                    details: developmentError,
                }
                : {}),
        },
    });
};
