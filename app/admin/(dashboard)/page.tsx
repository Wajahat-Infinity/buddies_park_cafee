import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getCounts() {
  const supabase = await createClient();

  const [categories, items, slides, unavailable] = await Promise.all([
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("menu_items").select("*", { count: "exact", head: true }),
    supabase
      .from("carousel_slides")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .eq("is_available", false),
  ]);

  return {
    categories: categories.count ?? 0,
    items: items.count ?? 0,
    slides: slides.count ?? 0,
    unavailable: unavailable.count ?? 0,
  };
}

export default async function AdminDashboard() {
  const counts = await getCounts();

  const cards = [
    { label: "Categories", value: counts.categories, href: "/admin/categories" },
    { label: "Menu items", value: counts.items, href: "/admin/menu" },
    { label: "Active slides", value: counts.slides, href: "/admin/carousel" },
    { label: "Sold out", value: counts.unavailable, href: "/admin/menu" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Button asChild variant="outline" size="sm">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            View live site
          </a>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-card rounded-xl border p-4 transition-colors hover:border-foreground/20"
          >
            <p className="text-2xl font-semibold tabular-nums">{card.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
