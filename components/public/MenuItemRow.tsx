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
 * A menu item as one compact row: photo on the left, name and price on the
 * right with the add button. Used on phones, where a full card per item turned
 * a category into screens of scrolling, and for the home page's quick picks.
 */
export function MenuItemRow({
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
  const tags = (item.tags ?? []).filter(Boolean).slice(0, 2);
  const soldOut = !item.is_available;

  return (
    <article
      className={cn(
        "shadow-card text-park flex gap-3 rounded-2xl bg-white p-2",
        soldOut && "opacity-70 saturate-50",
        className
      )}
    >
      <div
        ref={photoRef}
        className="bg-paper relative size-22 shrink-0 self-start overflow-hidden rounded-xl"
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
              sizes="88px"
              className={cn(
                "object-cover transition-opacity duration-500",
                soldOut && "grayscale",
                loaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="text-park/40 flex size-full items-center justify-center">
            <UtensilsCrossed className="size-6" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5 pr-1">
        <h3 className="text-[0.95rem] leading-snug font-bold text-balance">
          {item.name}
        </h3>

        {description ? (
          <p className="text-park/60 mt-0.5 line-clamp-2 text-xs text-pretty">
            {description}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <p className="text-park/70 mt-1 truncate text-[0.7rem] font-semibold">
            {tags.join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <span className="font-poster text-[1.4rem] leading-none font-black tabular-nums">
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
