import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/app-error";
import { createAccessToken, generateRefreshToken, hashRefreshToken, } from "./tokens";
import { hashPassword, verifyPassword } from "./password";
import { env } from "node:process";
const publicUserSelect = {
    id: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
};
export async function register(input) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });
    if (existingUser) {
        throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "An account with this email already exists.");
    }
    const passwordHash = await hashPassword(input.password);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    const familyId = randomUUID();
    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: input.email,
                    passwordHash,
                    role: "USER",
                    status: "ACTIVE",
                },
                select: publicUserSelect,
            });
            const ttlDays = Number(env.REFRESH_TOKEN_TTL_DAYS ?? 7);
            if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
                throw new Error("REFRESH_TOKEN_TTL_DAYS must be a positive number");
            }
            const session = await tx.authSession.create({
                data: {
                    userId: user.id,
                    tokenHash,
                    familyId,
                    expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
                },
                select: {
                    id: true,
                },
            });
            return {
                user,
                sessionId: session.id,
            };
        });
        const accessToken = await createAccessToken(result.user.id, result.user.role, result.sessionId);
        return {
            accessToken,
            refreshToken,
            user: result.user,
        };
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002") {
            throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "An account with this email already exists.");
        }
        throw error;
    }
}
export async function login(input) {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });
    if (!user) {
        throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }
    const passwordValid = await verifyPassword(user.passwordHash, input.password);
    if (!passwordValid) {
        throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }
    if (user.status !== "ACTIVE") {
        throw new AppError(403, "ACCOUNT_UNAVAILABLE", "This account is currently unavailable.");
    }
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    const familyId = randomUUID();
    const ttlDays = Number(env.REFRESH_TOKEN_TTL_DAYS ?? 7);
    if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
        throw new Error("REFRESH_TOKEN_TTL_DAYS must be a positive number");
    }
    const session = await prisma.authSession.create({
        data: {
            userId: user.id,
            tokenHash,
            familyId,
            expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
        },
        select: {
            id: true,
        },
    });
    const accessToken = await createAccessToken(user.id, user.role, session.id);
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
        },
    };
}
export async function refresh(rawRefreshToken) {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const currentSession = await prisma.authSession.findUnique({
        where: {
            tokenHash,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
    });
    if (!currentSession) {
        throw new AppError(401, "INVALID_REFRESH_TOKEN", "Session is invalid or expired.");
    }
    const now = new Date();
    if (currentSession.expiresAt <= now) {
        throw new AppError(401, "REFRESH_TOKEN_EXPIRED", "Session is invalid or expired.");
    }
    if (currentSession.user.status !== "ACTIVE") {
        throw new AppError(403, "ACCOUNT_UNAVAILABLE", "This account is currently unavailable.");
    }
    if (currentSession.revokedAt) {
        await prisma.authSession.updateMany({
            where: {
                familyId: currentSession.familyId,
                revokedAt: null,
            },
            data: {
                revokedAt: now,
            },
        });
        throw new AppError(401, "REFRESH_TOKEN_REUSE_DEDTECTED", "Session is no longer valid.");
    }
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);
    const rotation = await prisma.$transaction(async (tx) => {
        const revoked = await tx.authSession.updateMany({
            where: {
                id: currentSession.id,
                revokedAt: null,
                expiresAt: {
                    gt: now,
                },
            },
            data: {
                revokedAt: now,
                lastUsedAt: now,
            },
        });
        if (revoked.count !== 1) {
            await tx.authSession.updateMany({
                where: {
                    familyId: currentSession.familyId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            });
            throw new AppError(401, "REFRESH_TOKEN_REUSE_DETECTED", "Session is no longer valid.");
        }
        const ttlDays = Number(env.REFRESH_TOKEN_TTL_DAYS ?? 7);
        if (!Number.isFinite(ttlDays) || ttlDays <= 0) {
            throw new Error("REFRESH_TOKEN_TTL_DAYS must be a positive number");
        }
        const newSession = await tx.authSession.create({
            data: {
                userId: currentSession.user.id,
                tokenHash: newTokenHash,
                familyId: currentSession.familyId,
                expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
            },
            select: {
                id: true,
            },
        });
        return {
            sessionId: newSession.id,
        };
    });
    const accessToken = await createAccessToken(currentSession.user.id, currentSession.user.role, rotation.sessionId);
    return {
        accessToken,
        refreshToken: newRefreshToken,
        user: currentSession.user,
    };
}
export async function logout(rawRefreshToken) {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    await prisma.authSession.updateMany({
        where: {
            tokenHash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
}
