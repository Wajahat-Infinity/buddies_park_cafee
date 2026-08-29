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
    <section className="mx-auto max-w-5xl px-4 py-10">
      <FadeIn>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Popular right now
        </h2>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Carousel opts={{ align: "start", loop: false }} className="mt-5">
          <CarouselContent className="-ml-3">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-[78%] pl-3 sm:basis-1/2 lg:basis-1/3"
              >
                <MenuItemCard item={item} currency={currency} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </FadeIn>
    </section>
  );
}
