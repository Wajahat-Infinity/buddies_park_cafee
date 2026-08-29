"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { clean, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/lib/types";

/**
 * A single menu item. The add button turns into a quantity stepper once the
 * item is in the cart; unavailable items can never be added.
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
  const { addItem, increment, decrement, quantityOf } = useCart();
  const quantity = quantityOf(item.id);
  const description = clean(item.description);
  const imageUrl = clean(item.image_url);
  const tags = (item.tags ?? []).filter(Boolean);
  const soldOut = !item.is_available;

  return (
    <article
      className={cn(
        "bg-card group flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-300",
        soldOut
          ? "opacity-60"
          : "hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md",
        className
      )}
    >
      <div className="bg-muted relative aspect-4/3 w-full overflow-hidden">
        {imageUrl ? (
          <>
            {loaded ? null : (
              <Skeleton className="absolute inset-0 rounded-none" />
            )}
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className={cn(
                "object-cover transition-all duration-500",
                soldOut ? "grayscale" : "group-hover:scale-105",
                loaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <UtensilsCrossed className="size-8" />
          </div>
        )}

        {soldOut ? (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Sold out
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="leading-snug font-semibold text-balance">
            {item.name}
          </h3>
          <span className="shrink-0 text-sm font-semibold whitespace-nowrap">
            {formatPrice(item.price, currency)}
          </span>
        </div>

        {description ? (
          <p className="text-muted-foreground line-clamp-3 text-sm text-pretty">
            {description}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-1">
          <AnimatePresence mode="wait" initial={false}>
            {quantity > 0 && !soldOut ? (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex items-center justify-between gap-2 rounded-md border p-1"
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 transition-transform active:scale-90"
                  onClick={() => decrement(item.id)}
                  aria-label={`Remove one ${item.name}`}
                >
                  <Minus className="size-4" />
                </Button>
                <span
                  aria-live="polite"
                  className="min-w-6 text-center text-sm font-semibold tabular-nums"
                >
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 transition-transform active:scale-90"
                  onClick={() => increment(item.id)}
                  aria-label={`Add one more ${item.name}`}
                >
                  <Plus className="size-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Button
                  size="sm"
                  className="w-full transition-transform active:scale-95"
                  disabled={soldOut}
                  onClick={() => addItem(item)}
                >
                  {soldOut ? (
                    "Unavailable"
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Add
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}
