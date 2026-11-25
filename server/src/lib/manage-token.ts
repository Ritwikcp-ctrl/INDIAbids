import { createHash, randomBytes } from "node:crypto";

/**
 * Generate a cryptographically secure random manageToken (returned once to the user).
 */
export function generateManageToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash manageToken with SHA-256 for at-rest storage.
 */
export function hashManageToken(token: string): string {
  return createHash("sha256").update(token.trim(), "utf8").digest("hex");
}
