"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FadeIn } from "@/components/motion/FadeIn";
import { MenuItemCard } from "@/components/public/MenuItemCard";
import { SectionHeading } from "@/components/public/SectionHeading";
import type { MenuItem } from "@/lib/types";

/**
 * Horizontally scrolling featured items. Card widths leave part of the next
 * card visible so it reads as scrollable. Renders nothing when empty.
 */
export function FeaturedCarousel({
  items,
  currency,
}: {
  items: MenuItem[];
  currency: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-14">
      <FadeIn>
        <SectionHeading eyebrow="Fresh from the garden">
          Popular right now
        </SectionHeading>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Carousel opts={{ align: "start", loop: false }} className="mt-8">
          {/* Vertical padding on the track, not the items: a card lifts and
              casts a shadow on hover, and without the room it clips against
              the carousel's own overflow. */}
          <CarouselContent className="-ml-3 py-4">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-[78%] pl-3 sm:basis-1/2 lg:basis-1/3"
              >
                <MenuItemCard item={item} currency={currency} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="shadow-rest hidden size-10 border-none sm:flex" />
          <CarouselNext className="shadow-rest hidden size-10 border-none sm:flex" />
        </Carousel>
      </FadeIn>
    </section>
  );
}
