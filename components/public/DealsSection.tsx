"use client";

import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DealCard } from "@/components/public/DealCard";
import { HeadingLink, SectionHeading } from "@/components/public/SectionHeading";
import type { Deal } from "@/lib/types";

/**
 * The home page's deals, on a park green band. Each card can be added to the
 * order right here; the full list lives on /deals. Renders nothing when no
 * deal is switched on.
 */
export function DealsSection({
  deals,
  currency,
}: {
  deals: Deal[];
  currency: string;
}) {
  if (deals.length === 0) return null;

  return (
    <section id="deals" className="bg-park scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12">
        <SectionHeading
          tone="dark"
          eyebrow="Good food. Better value."
          action={
            <Link href="/deals" className="group">
              <HeadingLink tone="dark">All {deals.length} deals →</HeadingLink>
            </Link>
          }
        >
          Hot deals
        </SectionHeading>

        <Carousel opts={{ align: "start", loop: false }} className="mt-8">
          <CarouselContent className="-ml-4">
            {deals.map((deal) => (
              <CarouselItem
                key={deal.id}
                className="basis-[86%] pl-4 sm:basis-1/2 lg:basis-1/3"
              >
                <DealCard deal={deal} currency={currency} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="bg-lime text-park hover:bg-lime hidden size-11 border-none hover:brightness-95 disabled:opacity-0 sm:flex" />
          <CarouselNext className="bg-lime text-park hover:bg-lime hidden size-11 border-none hover:brightness-95 disabled:opacity-0 sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
