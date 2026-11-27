import { env } from "../config/env";
import { AppError } from "../lib/app-error";
const allowedOrigins = env.CORS_ORIGIN.split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
export function requireSameOrigin(req, res, next) {
    const origin = req.get("origin")?.trim().replace(/\/$/, "");
    if (!origin) {
        const referer = req.get("referer");
        if (referer) {
            try {
                const refOrigin = new URL(referer).origin;
                if (!allowedOrigins.includes(refOrigin)) {
                    next(new AppError(403, "INVALID_ORIGIN", "Request origin is not allowed."));
                    return;
                }
            }
            catch {
                next(new AppError(403, "INVALID_ORIGIN", "Invalid referer header."));
                return;
            }
        }
        next();
        return;
    }
    if (!allowedOrigins.includes(origin)) {
        next(new AppError(403, "INVALID_ORIGIN", "Request origin is not allowed."));
        return;
    }
    next();
}
