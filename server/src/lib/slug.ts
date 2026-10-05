import { randomBytes } from "node:crypto";

function randomSuffix():string {
    return randomBytes(4).toString("hex");
}

export function slugify(value:string):string {
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

export function createFallbackBusinessSlug():string {
    return `business-${randomSuffix()}`;
}

export function createUniqueallbackSlug(
    baseSlug:string,
) : string {
   return `${baseSlug}-${randomSuffix()}`;
}