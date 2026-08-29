/** Shared constants and helpers for the public `media` storage bucket. */

export const MEDIA_BUCKET = "media";

export type MediaFolder = "logo" | "menu" | "carousel";

const PUBLIC_PREFIX = `/storage/v1/object/public/${MEDIA_BUCKET}/`;

/**
 * Turns a public storage URL back into the object path needed to delete it.
 * Returns null for anything that is not a URL in this bucket, so an externally
 * hosted image is never mistaken for one of ours.
 */
export function publicUrlToPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const index = url.indexOf(PUBLIC_PREFIX);
  if (index === -1) return null;

  const path = url.slice(index + PUBLIC_PREFIX.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Builds a collision free object path inside a folder. */
export function buildMediaPath(folder: MediaFolder, extension: string) {
  return `${folder}/${crypto.randomUUID()}.${extension}`;
}

/** Lowercase, hyphenated, unique-able slug for a category name. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
