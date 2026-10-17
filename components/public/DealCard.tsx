"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { clean, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import type { Deal } from "@/lib/types";

/**
 * Splits a deal name so its last word can be picked out in lime, the way the
 * printed posters set "SHAWARMA DUO" and "FRIENDS FEAST".
 */
function splitName(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return ["", name];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

/**
 * One deal, styled after the printed posters: a deep green panel, the name on
 * a brush stroke, the contents as a bullet list and the price on a lime tag.
 *
 * The card is its own size container. Narrow (a carousel slot, a phone) it
 * stacks the photo above the details; given room, as on the deals page, it
 * turns into the poster's wide banner with the photo on the right.
 */
export function DealCard({
  deal,
  currency,
  className,
}: {
  deal: Deal;
  currency: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const { addItem, increment, decrement, quantityOf } = useCart();
  const quantity = quantityOf(deal.id);
  const imageUrl = clean(deal.image_url);
  const badge = clean(deal.badge);
  const [head, tail] = splitName(deal.name);

  function add() {
    addItem({
      id: deal.id,
      // Marked as a deal so the order message is unambiguous for the kitchen.
      name: `${deal.name} (Deal)`,
      price: Number(deal.price),
      image_url: deal.image_url,
      is_available: deal.is_active,
    });
  }

  return (
    <article
      className={cn(
        "@container group from-leaf-deep text-hero-ink shadow-lift relative h-full overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br to-[color-mix(in_oklch,var(--leaf-deep)_70%,black)]",
        className
      )}
    >
      <div className="flex h-full flex-col @2xl:flex-row-reverse">
        {/* Photo */}
        <div className="sheen relative aspect-16/10 w-full shrink-0 overflow-hidden @2xl:aspect-auto @2xl:min-h-72 @2xl:w-[56%]">
          {imageUrl ? (
            <>
              {loaded ? null : (
                <Skeleton className="absolute inset-0 rounded-none bg-white/10" />
              )}
              <Image
                src={imageUrl}
                alt={deal.name}
                fill
                sizes="(min-width: 1024px) 560px, (min-width: 640px) 60vw, 92vw"
                className={cn(
                  "object-cover transition-all duration-700 ease-out group-hover:scale-105",
                  loaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div className="flex size-full items-center justify-center bg-white/5 text-white/40">
              <UtensilsCrossed className="size-10" />
            </div>
          )}

          {/* The photo melts into the panel: downward when stacked, toward the
              text when the card is a wide banner. */}
          <div className="from-leaf-deep absolute inset-x-0 bottom-0 h-16 bg-linear-to-t to-transparent @2xl:inset-y-0 @2xl:right-auto @2xl:left-0 @2xl:h-auto @2xl:w-24 @2xl:bg-linear-to-r" />

          {badge ? (
            <span className="bg-zest text-zest-ink shadow-rest absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase">
              {badge}
            </span>
          ) : null}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-4 p-5 pt-3 @2xl:justify-center @2xl:p-8">
          <h3 className="brush bg-zest-ink font-heading self-start px-4 py-2 text-2xl leading-none font-extrabold tracking-tight uppercase @2xl:text-3xl">
            {head ? <span>{head} </span> : null}
            <span className="text-zest">{tail}</span>
          </h3>

          {deal.items.length > 0 ? (
            <ul className="space-y-1.5 text-sm font-medium @2xl:text-base">
              {deal.items.map((line, index) => (
                <li key={`${line}-${index}`} className="flex items-start gap-2.5">
                  <span className="bg-zest mt-1.5 size-2 shrink-0 rounded-full @2xl:mt-2" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2 @2xl:mt-2">
            <div className="brush bg-zest text-zest-ink -rotate-2 px-4 pt-1.5 pb-2">
              <p className="text-[0.7rem] leading-none font-extrabold tracking-wider uppercase">
                Only
              </p>
              <p className="font-heading text-3xl leading-none font-extrabold tabular-nums">
                {formatPrice(deal.price, currency)}
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {quantity > 0 ? (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-9 rounded-full text-inherit transition-transform hover:bg-white/15 hover:text-inherit active:scale-90"
                    onClick={() => decrement(deal.id)}
                    aria-label={`Remove one ${deal.name}`}
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
                    className="size-9 rounded-full text-inherit transition-transform hover:bg-white/15 hover:text-inherit active:scale-90"
                    onClick={() => increment(deal.id)}
                    aria-label={`Add one more ${deal.name}`}
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
                    size="lg"
                    className="bg-hero-ink text-zest-ink press-3d h-11 rounded-full px-5 font-semibold hover:bg-white"
                    onClick={add}
                  >
                    <Plus className="size-4" />
                    Add deal
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </article>
  );
}
