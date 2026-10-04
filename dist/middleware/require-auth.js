import { AppError } from "../lib/app-error";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../modules/auth/tokens";
export async function requireAuth(req, res, next) {
    try {
        const authorization = req.get("authorization");
        if (!authorization || !authorization.startsWith("Bearer")) {
            throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
        }
        const token = authorization.slice("Bearer".length).trim();
        if (!token) {
            throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authenticatin token is required.");
        }
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
            throw new AppError(401, "SESSION_INVALID", "Authentication session is invalid.");
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
