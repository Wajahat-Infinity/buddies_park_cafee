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
 * A menu item as one compact row: photo on the left, details and the add
 * button on the right. Used on phones, where a full card per item turned a
 * category of seven burgers into three screens of scrolling; the larger
 * MenuItemCard takes over from the `sm` breakpoint.
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
        "surface-3d flex gap-3 rounded-2xl border p-2.5",
        soldOut && "opacity-70 saturate-50",
        className
      )}
    >
      <div
        ref={photoRef}
        className="bg-muted relative size-24 shrink-0 self-start overflow-hidden rounded-xl"
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
              sizes="96px"
              className={cn(
                "object-cover transition-opacity duration-500",
                soldOut && "grayscale",
                loaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="from-muted to-secondary text-muted-foreground flex size-full items-center justify-center bg-linear-to-br">
            <UtensilsCrossed className="size-6" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h3 className="font-heading text-[0.95rem] leading-snug font-semibold text-balance">
          {item.name}
        </h3>

        {description ? (
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs text-pretty">
            {description}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <p className="text-leaf-deep mt-1 truncate text-[0.7rem] font-medium">
            {tags.join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-clay font-semibold tabular-nums">
            {formatPrice(item.price, currency)}
          </span>
          <AddToOrder
            compact
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
