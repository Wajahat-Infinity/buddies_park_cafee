import Link from "next/link";

import { DealCard } from "@/components/public/DealCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { getActiveDeals, getSettings } from "@/lib/queries";

export const metadata = { title: "Deals" };

/** Every active deal as a wide poster banner, one under the other. */
export default async function DealsPage() {
  const [settings, deals] = await Promise.all([
    getSettings(),
    getActiveDeals(),
  ]);

  return (
    <section className="bg-park">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-16">
        <SectionHeading as="h1" tone="dark" eyebrow="Good food. Better value.">
          Hot deals
        </SectionHeading>

        {deals.length === 0 ? (
          <div className="mt-6 text-white/75">
            <p className="text-sm">
              No deals are running right now. The full menu is always available.
            </p>
            <Link
              href="/menu"
              className="bg-lime text-park mt-5 inline-flex h-11 items-center rounded-full px-6 font-bold"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm font-semibold text-white/60">
              {deals.length} {deals.length === 1 ? "deal" : "deals"} running
            </p>
            <div className="mt-8 grid gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} currency={settings.currency} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
