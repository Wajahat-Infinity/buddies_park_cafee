"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { clean, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/lib/types";

/** How far the card leans, in degrees, at the very edge of the pointer travel. */
const TILT_X = 7;
const TILT_Y = 9;

/** Weighty but quick — a physical card settling, not a spring toy. */
const SPRING = { stiffness: 190, damping: 20, mass: 0.5 } as const;

/**
 * True only for a mouse or trackpad. A finger already carries the card around
 * by scrolling, and a tilt that chases a touch point reads as a glitch, so the
 * whole 3D treatment is desktop only.
 */
function useFinePointer() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setFine(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return fine;
}

/**
 * A single menu item, rendered as a physical card: it leans toward the pointer,
 * catches a highlight where the pointer sits, and lifts off the page on hover.
 * The add button turns into a quantity stepper once the item is in the cart;
 * unavailable items can never be added.
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

  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const tilting = finePointer && !reduceMotion;

  // Pointer position across the card, -0.5 at one edge to 0.5 at the other.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-TILT_Y, TILT_Y]), SPRING);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [TILT_X, -TILT_X]), SPRING);

  // Where the highlight pools, as a percentage of the card.
  const glareX = useTransform(pointerX, (value) => `${50 + value * 100}%`);
  const glareY = useTransform(pointerY, (value) => `${50 + value * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, oklch(1 0 0 / 0.28), transparent 55%)`;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!tilting) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    // Perspective belongs to the wrapper: on the card itself every card would
    // get its own vanishing point and a grid of them would look warped.
    <div className={cn("scene h-full", className)}>
      <motion.article
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        style={
          tilting
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : undefined
        }
        whileHover={tilting && !soldOut ? { z: 34, scale: 1.02 } : undefined}
        transition={SPRING}
        className={cn(
          "surface-3d group relative flex h-full flex-col rounded-2xl border",
          // No `overflow-hidden` here: it would flatten preserve-3d and collapse
          // every layer below back onto one plane. The image clips itself.
          soldOut && "opacity-70 saturate-50"
        )}
      >
        <div className="preserve-3d relative">
          <div className="bg-muted sheen relative aspect-4/3 w-full overflow-hidden rounded-t-2xl">
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
                    "object-cover transition-all duration-700 ease-out",
                    soldOut ? "grayscale" : "group-hover:scale-110",
                    loaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setLoaded(true)}
                />
              </>
            ) : (
              <div className="from-muted to-secondary text-muted-foreground flex size-full items-center justify-center bg-linear-to-br">
                <UtensilsCrossed className="size-8" />
              </div>
            )}

            {/* Photography sits under a warm scrim at its foot, so the price
                chip below always has something soft to land on. */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/45 to-transparent" />
          </div>

          {soldOut ? (
            <Badge
              variant="secondary"
              className="shadow-rest absolute top-3 left-3"
              style={{ transform: "translateZ(46px)" }}
            >
              Sold out
            </Badge>
          ) : null}

          {/* The price rides above the surface as a clay tile, the way a little
              enamel tag sits propped against a dish. */}
          <span
            className="bg-clay text-primary-foreground shadow-float absolute -bottom-3 right-3 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums"
            style={{ transform: "translateZ(52px)" }}
          >
            {formatPrice(item.price, currency)}
          </span>
        </div>

        <div
          className="preserve-3d flex flex-1 flex-col gap-2 p-4 pt-5"
          style={{ transform: "translateZ(24px)" }}
        >
          <h3 className="font-heading leading-snug font-semibold text-balance">
            {item.name}
          </h3>

          {description ? (
            <p className="text-muted-foreground line-clamp-3 text-sm text-pretty">
              {description}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-leaf/30 bg-leaf/8 text-leaf-deep text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-auto pt-1" style={{ transform: "translateZ(14px)" }}>
            <AnimatePresence mode="wait" initial={false}>
              {quantity > 0 && !soldOut ? (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="bg-secondary/60 flex items-center justify-between gap-2 rounded-full border p-1"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full transition-transform active:scale-90"
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
                    className="size-8 rounded-full transition-transform active:scale-90"
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
                    size="lg"
                    className={cn(
                      "h-10 w-full rounded-full",
                      !soldOut && "press-3d"
                    )}
                    disabled={soldOut}
                    onClick={() => addItem(item)}
                  >
                    {soldOut ? (
                      "Unavailable"
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Add to order
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Highlight following the pointer. Sits above every layer but takes no
            events, so the card underneath stays fully interactive. */}
        {tilting ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare, transform: "translateZ(60px)" }}
          />
        ) : null}
      </motion.article>
    </div>
  );
}
