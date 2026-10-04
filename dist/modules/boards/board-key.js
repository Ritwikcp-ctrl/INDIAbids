import { slugify } from "../../lib/slug";
export function createBoardKey(input) {
    const parts = [
        input.categorySlug,
        input.country.toLowerCase(),
        input.state ? slugify(input.state) : undefined,
        input.city ? slugify(input.city) : undefined,
    ].filter(Boolean);
    return parts.join(":");
}
