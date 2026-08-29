import { CategoryManager } from "@/components/admin/CategoryManager";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*, menu_items(count)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const categories = ((data ?? []) as (Category & {
    menu_items: { count: number }[];
  })[]).map(({ menu_items, ...category }) => ({
    ...category,
    itemCount: menu_items?.[0]?.count ?? 0,
  }));

  return <CategoryManager categories={categories} />;
}
