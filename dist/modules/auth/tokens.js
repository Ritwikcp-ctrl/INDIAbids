import { createHash, randomBytes, randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { env } from "../../config/env";
const secretBytes = Buffer.from(env.ACCESS_TOKEN_SECRET, "base64");
if (secretBytes.length < 32) {
    throw new Error("ACCESS_TOKEN_SECRET must decode to at least 32 bytes.");
}
const secret = new Uint8Array(secretBytes);
export function generateRefreshToken() {
    return randomBytes(64).toString("base64url");
}
export function hashRefreshToken(token) {
    return createHash("sha256").update(token, "utf8").digest("hex");
}
export async function createAccessToken(userId, role, sessionId) {
    return new SignJWT({
        role,
        sid: sessionId,
    })
        .setProtectedHeader({
        alg: "HS256",
        type: "JWT",
    })
        .setSubject(userId)
        .setIssuer(env.ACCESS_TOKEN_ISSUER)
        .setAudience(env.ACCESS_TOKEN_AUDIENCE)
        .setIssuedAt()
        .setJti(randomUUID())
        .setExpirationTime(`${env.ACCESS_TOKEN_TTL_MINUTES}m`)
        .sign(secret);
}
export async function verifyAccessToken(token) {
    const result = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
        issuer: env.ACCESS_TOKEN_ISSUER,
        audience: env.ACCESS_TOKEN_AUDIENCE,
    });
    return result.payload;
}
