import { REAL_CATEGORIES } from "./categories";

export type Category = (typeof REAL_CATEGORIES)[number]["name"];

export interface CategoryCardInfo {
  name: string;
  slug: string;
  description: string;
}
