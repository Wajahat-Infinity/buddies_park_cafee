import Link from "next/link";

import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { DealCard } from "@/components/public/DealCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import { Button } from "@/components/ui/button";
import { getActiveDeals, getSettings } from "@/lib/queries";

export const metadata = { title: "Deals" };

/** Every active deal as a wide poster banner, one under the other. */
export default async function DealsPage() {
  const [settings, deals] = await Promise.all([
    getSettings(),
    getActiveDeals(),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <FadeIn>
        <SectionHeading as="h1" eyebrow="Good food. Better value.">
          Buddies&rsquo; hot deals
        </SectionHeading>
      </FadeIn>

      {deals.length === 0 ? (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            No deals are running right now. The full menu is always available.
          </p>
          <Button asChild className="press-3d mt-5 rounded-full px-5">
            <Link href="/menu">Browse the menu</Link>
          </Button>
        </div>
      ) : (
        <StaggerGroup className="mt-10 space-y-6" stagger={0.08}>
          {deals.map((deal) => (
            <StaggerItem key={deal.id}>
              <DealCard deal={deal} currency={settings.currency} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </section>
  );
}
