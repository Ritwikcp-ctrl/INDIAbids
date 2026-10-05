import { slugify } from "../../lib/slug";

export function createBoardKey(input: {
  categorySlug: string;
  country: string;
  state?: string;
  city?: string;
}): string {
  const parts = [
    input.categorySlug,
    input.country.toLowerCase(),
    input.state ? slugify(input.state) : undefined,
    input.city ? slugify(input.city) : undefined,
  ].filter(Boolean);
  return parts.join(":");
}
