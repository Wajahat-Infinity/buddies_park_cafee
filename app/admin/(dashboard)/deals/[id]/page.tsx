import { notFound } from "next/navigation";

import { DealForm } from "@/components/admin/DealForm";
import { createClient } from "@/lib/supabase/server";
import type { Deal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditDealPage({
  params,
}: PageProps<"/admin/deals/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!deal) notFound();

  return <DealForm deal={deal as Deal} />;
}
