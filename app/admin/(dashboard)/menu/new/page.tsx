import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewMenuItemPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return <MenuItemForm categories={(data ?? []) as Category[]} />;
}
