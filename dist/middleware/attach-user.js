import { AppError } from "../lib/app-error.js";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../modules/auth/tokens.js";
/**
 * attachUser — optional auth.
 * If token present and invalid → 401 (never downgrade to anonymous).
 * If no token present → req.auth = undefined, proceeds as anonymous.
 */
export async function attachUser(req, res, next) {
    const authorization = req.get("authorization");
    if (!authorization) {
        req.auth = undefined;
        return next();
    }
    if (!authorization.startsWith("Bearer ")) {
        return next(new AppError(401, "INVALID_ACCESS_TOKEN", "Authorization header must be Bearer token."));
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        return next(new AppError(401, "INVALID_ACCESS_TOKEN", "Authentication token is required."));
    }
    try {
        const payload = await verifyAccessToken(token);
        if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
            throw new AppError(401, "INVALID_ACCESS_TOKEN", "Authentication token is invalid.");
        }
        const session = await prisma.authSession.findUnique({
            where: {
                id: payload.sid,
            },
            select: {
                userId: true,
                revokedAt: true,
                expiresAt: true,
                user: {
                    select: {
                        id: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });
        if (!session ||
            session.userId !== payload.sub ||
            session.revokedAt !== null ||
            session.expiresAt <= new Date() ||
            session.user.status !== "ACTIVE") {
            throw new AppError(401, "SESSION_INVALID", "Authentication session is invalid or expired.");
        }
        req.auth = {
            userId: session.user.id,
            role: session.user.role,
            sessionId: payload.sid,
        };
        next();
    }
    catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError(401, "INVALID_ACCESS_TOKEN", "Authentication token is invalid or expired."));
    }
}
