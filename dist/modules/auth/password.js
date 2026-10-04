import argon2 from "argon2";
const ARGON2_MEMORY_COST = 19_456;
const ARGON2_TIME_COST = 2;
const ARGON2_PARALLELISM = 1;
export async function hashPassword(password) {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: ARGON2_MEMORY_COST,
        timeCost: ARGON2_TIME_COST,
        parallelism: ARGON2_PARALLELISM,
    });
}
export async function verifyPassword(passwordHash, password) {
    return argon2.verify(passwordHash, password);
}
