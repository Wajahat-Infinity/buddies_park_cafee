import { clean } from "@/lib/format";
import type { CategoryWithItems } from "@/lib/types";

/**
 * The first photo in a category stands in as its picture. Categories have no
 * image of their own, so a new category gets one as soon as an item has one.
 */
export function categoryThumbnail(category: CategoryWithItems): string | null {
  for (const item of category.items) {
    const url = clean(item.image_url);
    if (url) return url;
  }
  return null;
}
