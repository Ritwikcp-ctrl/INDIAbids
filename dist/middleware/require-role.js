import { AppError } from "../lib/app-error";
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.auth) {
            next(new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required."));
            return;
        }
        if (!allowedRoles.includes(req.auth.role)) {
            next(new AppError(403, "FORBIDDEN", "You are not authorized to perform this action."));
            return;
        }
        next();
    };
}
