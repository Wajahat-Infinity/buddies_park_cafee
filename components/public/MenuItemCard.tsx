"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { UtensilsCrossed } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { AddToOrder } from "@/components/public/AddToOrder";
import { useFlyToCart } from "@/components/motion/FlyToCart";
import { cn } from "@/lib/utils";
import { clean, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/lib/types";

/**
 * A menu item as a flat card: photo on top, name and description, then the
 * price and the round add button on one line. Used from the `sm` breakpoint
 * up; phones get MenuItemRow. Unavailable items can never be added.
 */
export function MenuItemCard({
  item,
  currency,
  className,
}: {
  item: MenuItem;
  currency: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const { addItem } = useCart();
  const { fly } = useFlyToCart();
  const photoRef = useRef<HTMLDivElement>(null);
  const description = clean(item.description);
  const imageUrl = clean(item.image_url);
  const tags = (item.tags ?? []).filter(Boolean);
  const soldOut = !item.is_available;

  return (
    <article
      className={cn(
        "shadow-card group text-park flex h-full flex-col overflow-hidden rounded-2xl bg-white",
        soldOut && "opacity-70 saturate-50",
        className
      )}
    >
      <div
        ref={photoRef}
        className="bg-paper relative aspect-4/3 w-full overflow-hidden"
      >
        {imageUrl ? (
          <>
            {loaded ? null : (
              <Skeleton className="absolute inset-0 rounded-none" />
            )}
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
              className={cn(
                "object-cover transition-[opacity,transform] duration-500 ease-out",
                soldOut ? "grayscale" : "group-hover:scale-105",
                loaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="text-park/40 flex size-full items-center justify-center">
            <UtensilsCrossed className="size-8" />
          </div>
        )}

        {soldOut ? (
          <span className="bg-park absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-bold text-white">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="leading-snug font-bold text-balance">{item.name}</h3>

        {description ? (
          <p className="text-park/60 line-clamp-2 text-sm text-pretty">
            {description}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-lime/25 rounded-full px-2 py-0.5 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-poster text-[1.7rem] leading-none font-black tabular-nums">
            {formatPrice(item.price, currency)}
          </span>
          <AddToOrder
            id={item.id}
            name={item.name}
            soldOut={soldOut}
            onAdd={() => {
              addItem(item);
              fly(photoRef.current);
            }}
          />
        </div>
      </div>
    </article>
  );
}
