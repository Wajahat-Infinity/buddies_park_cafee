import { MenuTable } from "@/components/admin/MenuTable";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import type { Category, MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: items }, settings] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    getSettings(),
  ]);

  return (
    <MenuTable
      items={(items ?? []) as MenuItem[]}
      categories={(categories ?? []) as Category[]}
      currency={settings.currency}
    />
  );
}
