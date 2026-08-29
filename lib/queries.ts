import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  FALLBACK_SETTINGS,
  type CarouselSlide,
  type CategoryWithItems,
  type MenuItem,
  type SiteSettings,
} from "@/lib/types";

/**
 * Read helpers for the public site. Every one of them degrades to empty or
 * fallback data rather than throwing, so a missing table, an empty table or an
 * unreachable Supabase never takes the storefront down.
 */

function warn(source: string, error: unknown) {
  console.error(`[queries] ${source} failed:`, error);
}

export async function getSettings(): Promise<SiteSettings> {
  if (!hasSupabaseEnv()) return FALLBACK_SETTINGS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return FALLBACK_SETTINGS;

    // Guard the two fields the UI cannot render without.
    return {
      ...FALLBACK_SETTINGS,
      ...data,
      cafe_name: data.cafe_name || FALLBACK_SETTINGS.cafe_name,
      currency: data.currency || FALLBACK_SETTINGS.currency,
    } as SiteSettings;
  } catch (error) {
    warn("getSettings", error);
    return FALLBACK_SETTINGS;
  }
}

export async function getActiveSlides(): Promise<CarouselSlide[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as CarouselSlide[];
  } catch (error) {
    warn("getActiveSlides", error);
    return [];
  }
}

/**
 * Active categories in sort order, each with its items nested. Categories with
 * no items are dropped so the menu never renders an empty tab.
 */
export async function getCategoriesWithItems(): Promise<CategoryWithItems[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*, items:menu_items(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .order("sort_order", { referencedTable: "menu_items", ascending: true })
      .order("name", { referencedTable: "menu_items", ascending: true });

    if (error) throw error;

    return ((data ?? []) as CategoryWithItems[])
      .map((category) => ({ ...category, items: category.items ?? [] }))
      .filter((category) => category.items.length > 0);
  } catch (error) {
    warn("getCategoriesWithItems", error);
    return [];
  }
}

/** Featured items, limited to what a carousel can sensibly show. */
export async function getFeaturedItems(limit = 12): Promise<MenuItem[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*, categories!inner(is_active)")
      .eq("is_featured", true)
      .eq("is_available", true)
      .eq("categories.is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Drop the join column the UI has no use for.
    return ((data ?? []) as (MenuItem & { categories?: unknown })[]).map(
      (row) => {
        const item = { ...row };
        delete item.categories;
        return item as MenuItem;
      }
    );
  } catch (error) {
    warn("getFeaturedItems", error);
    return [];
  }
}
