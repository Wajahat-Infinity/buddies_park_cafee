import Link from "next/link";

import { MenuItemRow } from "@/components/public/MenuItemRow";
import { HeadingLink, SectionHeading } from "@/components/public/SectionHeading";
import type { MenuItem } from "@/lib/types";

/** How many featured items the home page shows; the menu has the rest. */
const LIMIT = 6;

/**
 * The owner's featured items as compact rows, so a visitor can order a
 * favourite without opening the menu. Renders nothing when none are featured.
 */
export function PopularItems({
  items,
  currency,
}: {
  items: MenuItem[];
  currency: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <SectionHeading
        eyebrow="Quick picks"
        action={
          <Link href="/menu" className="group">
            <HeadingLink>Full menu →</HeadingLink>
          </Link>
        }
      >
        Popular right now
      </SectionHeading>

      <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, LIMIT).map((item) => (
          <MenuItemRow key={item.id} item={item} currency={currency} />
        ))}
      </div>
    </section>
  );
}
