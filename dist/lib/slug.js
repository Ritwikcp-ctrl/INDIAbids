import { randomBytes } from "node:crypto";
function randomSuffix() {
    return randomBytes(4).toString("hex");
}
export function slugify(value) {
    const slug = value
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
    return slug;
}
export function createFallbackBusinessSlug() {
    return `business-${randomSuffix()}`;
}
export function createUniqueallbackSlug(baseSlug) {
    return `${baseSlug}-${randomSuffix()}`;
}
