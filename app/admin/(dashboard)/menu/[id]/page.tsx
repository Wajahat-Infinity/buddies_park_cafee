import { notFound } from "next/navigation";

import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { createClient } from "@/lib/supabase/server";
import type { Category, MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditMenuItemPage({
  params,
}: PageProps<"/admin/menu/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: item }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("menu_items").select("*").eq("id", id).maybeSingle(),
  ]);

  if (!item) notFound();

  return (
    <MenuItemForm
      categories={(categories ?? []) as Category[]}
      item={item as MenuItem}
    />
  );
}
