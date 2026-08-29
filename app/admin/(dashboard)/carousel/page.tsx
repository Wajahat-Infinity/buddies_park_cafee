import { CarouselManager } from "@/components/admin/CarouselManager";
import { createClient } from "@/lib/supabase/server";
import type { CarouselSlide } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CarouselPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("carousel_slides")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return <CarouselManager slides={(data ?? []) as CarouselSlide[]} />;
}
