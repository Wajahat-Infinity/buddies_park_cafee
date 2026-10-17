import { DealTable } from "@/components/admin/DealTable";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries";
import type { Deal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const supabase = await createClient();

  const [{ data: deals }, settings] = await Promise.all([
    supabase
      .from("deals")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    getSettings(),
  ]);

  return (
    <DealTable deals={(deals ?? []) as Deal[]} currency={settings.currency} />
  );
}
