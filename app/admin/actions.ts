"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET, publicUrlToPath, slugify } from "@/lib/storage";

/** Every action returns this shape so the client can toast success or failure. */
export type ActionResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Writes are also guarded by row level security; this check exists so an
 * expired session produces a clear message instead of a policy violation.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Your session has expired. Please sign in again.");
  return supabase;
}

function fail(error: unknown): ActionResult {
  const message = error instanceof Error ? error.message : GENERIC_ERROR;
  console.error("[admin action]", error);
  return { ok: false, error: message };
}

/** Public pages read this data, so every mutation refreshes the home page. */
function revalidatePublic() {
  revalidatePath("/", "page");
}

/** Removes an image from the bucket, ignoring URLs we do not own. */
async function deleteMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null | undefined
) {
  const path = publicUrlToPath(url);
  if (!path) return;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  // A failed cleanup should never block the database change.
  if (error) console.error("[admin action] media cleanup failed", error);
}

/* ------------------------------------------------------------ categories --- */

/** Appends a category, deriving a unique slug from the name. */
export async function createCategory(name: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "Enter a category name." };

    const base = slugify(trimmed) || "category";
    const { data: existing, error: slugError } = await supabase
      .from("categories")
      .select("slug")
      .like("slug", `${base}%`);
    if (slugError) throw slugError;

    const taken = new Set((existing ?? []).map((row) => row.slug));
    let slug = base;
    let suffix = 2;
    while (taken.has(slug)) slug = `${base}-${suffix++}`;

    const { data: last, error: lastError } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastError) throw lastError;

    const { error } = await supabase.from("categories").insert({
      name: trimmed,
      slug,
      sort_order: (last?.sort_order ?? 0) + 1,
    });
    if (error) throw error;

    revalidatePublic();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateCategory(
  id: string,
  values: { name?: string; is_active?: boolean }
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const patch: Record<string, unknown> = {};

    if (values.name !== undefined) {
      const trimmed = values.name.trim();
      if (!trimmed) return { ok: false, error: "Enter a category name." };
      patch.name = trimmed;
    }
    if (values.is_active !== undefined) patch.is_active = values.is_active;
    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await supabase
      .from("categories")
      .update(patch)
      .eq("id", id);
    if (error) throw error;

    revalidatePublic();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Swaps sort_order with the neighbour above or below. */
export async function moveCategory(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: rows, error } = await supabase
      .from("categories")
      .select("id, sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;

    const ordered = rows ?? [];
    const index = ordered.findIndex((row) => row.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || target < 0 || target >= ordered.length) {
      return { ok: true };
    }

    // Rewrite the whole column so duplicate or missing values self heal.
    const reordered = [...ordered];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];

    for (const [position, row] of reordered.entries()) {
      const { error: updateError } = await supabase
        .from("categories")
        .update({ sort_order: position + 1 })
        .eq("id", row.id);
      if (updateError) throw updateError;
    }

    revalidatePublic();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Deletes a category. Items cascade, so their images are removed first. */
export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    const { data: items, error: itemsError } = await supabase
      .from("menu_items")
      .select("image_url")
      .eq("category_id", id);
    if (itemsError) throw itemsError;

    for (const item of items ?? []) await deleteMedia(supabase, item.image_url);

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;

    revalidatePublic();
    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------------------ menu items --- */

export type MenuItemInput = {
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  tags: string[];
  sort_order: number;
};

function validateItem(input: MenuItemInput): string | null {
  if (!input.category_id) return "Choose a category.";
  if (!input.name.trim()) return "Enter an item name.";
  if (!Number.isFinite(input.price) || input.price < 0) {
    return "Enter a valid price.";
  }
  return null;
}

export async function createMenuItem(
  input: MenuItemInput
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const invalid = validateItem(input);
    if (invalid) return { ok: false, error: invalid };

    const { error } = await supabase
      .from("menu_items")
      .insert({ ...input, name: input.name.trim() });
    if (error) throw error;

    revalidatePublic();
    revalidatePath("/admin/menu");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateMenuItem(
  id: string,
  input: MenuItemInput
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const invalid = validateItem(input);
    if (invalid) return { ok: false, error: invalid };

    const { data: current, error: currentError } = await supabase
      .from("menu_items")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (currentError) throw currentError;

    const { error } = await supabase
      .from("menu_items")
      .update({ ...input, name: input.name.trim() })
      .eq("id", id);
    if (error) throw error;

    // A replaced photo leaves the old file orphaned in the bucket.
    if (current?.image_url && current.image_url !== input.image_url) {
      await deleteMedia(supabase, current.image_url);
    }

    revalidatePublic();
    revalidatePath("/admin/menu");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Used by the inline available and featured switches on the menu table. */
export async function setMenuItemFlag(
  id: string,
  field: "is_available" | "is_featured",
  value: boolean
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("menu_items")
      .update({ [field]: value })
      .eq("id", id);
    if (error) throw error;

    revalidatePublic();
    revalidatePath("/admin/menu");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();

    const { data: item, error: itemError } = await supabase
      .from("menu_items")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (itemError) throw itemError;

    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) throw error;

    await deleteMedia(supabase, item?.image_url);

    revalidatePublic();
    revalidatePath("/admin/menu");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
