"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { DealCard } from "@/components/public/DealCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import type { Deal } from "@/lib/types";

/**
 * The home page's deals strip, straight under the hero: deals are what most
 * visitors came for, so they get the first slot below the fold. Each card
 * can be added to the order right here; the full list lives on /deals.
 * Renders nothing when no deal is switched on.
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
    <section id="deals" className="mx-auto max-w-5xl scroll-mt-20 px-4 pt-14">
      <FadeIn>
        <SectionHeading eyebrow="Good food. Better value.">
          Buddies&rsquo; hot deals
        </SectionHeading>
      </FadeIn>

      <FadeIn delay={0.1}>
        {/* Deep padding on the track so the card shadows fade out fully instead
            of being sliced off by the carousel's overflow; the negative margin
            gives that room back to the layout. */}
        <Carousel opts={{ align: "start", loop: false }} className="-mb-8">
          <CarouselContent className="-ml-4 py-12">
            {deals.map((deal) => (
              <CarouselItem
                key={deal.id}
                className="basis-[86%] pl-4 sm:basis-1/2 lg:basis-1/3"
              >
                <DealCard deal={deal} currency={currency} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="shadow-rest hidden size-10 border-none sm:flex" />
          <CarouselNext className="shadow-rest hidden size-10 border-none sm:flex" />
        </Carousel>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-2 flex justify-center">
        <Button asChild variant="outline" className="shadow-rest h-10 rounded-full px-5">
          <Link href="/deals">
            See all deals
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </FadeIn>
    </section>
  );
}
