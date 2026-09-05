"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/public/CartDrawer";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/**
 * Sticky bottom bar. Slides up with the first item and away with the last, and
 * is fully removed from the tree (so it cannot be tapped) when empty.
 */
export function CartBar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const { itemCount, total } = useCart();
  const currency = settings.currency;
  const reduceMotion = useReducedMotion();
  const visible = itemCount > 0;

  return (
    <>
      {/* Keeps the last of the page clear of the fixed bar. */}
      <div className={visible ? "h-24" : "h-0"} aria-hidden />

      <AnimatePresence>
        {visible ? (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: "110%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "110%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-40 p-3"
          >
            <div
              data-garden-motion
              className="bg-card/85 mx-auto max-w-md rounded-full border p-1.5 backdrop-blur-md"
              style={{ animation: "halo 3.4s ease-out infinite" }}
            >
              <Button
                size="lg"
                className="h-11 w-full justify-between rounded-full px-5 text-base"
                onClick={() => setOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="size-4" />
                  <motion.span
                    key={itemCount}
                    initial={reduceMotion ? false : { scale: 1.35 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="tabular-nums"
                  >
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </motion.span>
                </span>
                <span className="tabular-nums">
                  {formatPrice(total, currency)}
                </span>
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CartDrawer open={open} onOpenChange={setOpen} settings={settings} />
    </>
  );
}
