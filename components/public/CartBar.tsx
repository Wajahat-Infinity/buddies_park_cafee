"use client";

import { useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

import { CartDrawer } from "@/components/public/CartDrawer";
import { useFlyToCart } from "@/components/motion/FlyToCart";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/**
 * The lime order bar. Slides up with the first item and away with the last;
 * on phones it rides just above the bottom tab bar. Fully removed from the
 * tree when empty, so it can never be tapped by accident.
 */
export function CartBar({ settings }: { settings: SiteSettings }) {
  const { itemCount, total, cartOpen, setCartOpen } = useCart();
  const currency = settings.currency;
  const reduceMotion = useReducedMotion();
  const visible = itemCount > 0;
  const { landings } = useFlyToCart();
  const [bar, animate] = useAnimate<HTMLButtonElement>();

  // The bar catches each item thrown into it with a small bounce.
  useEffect(() => {
    if (landings === 0 || !bar.current) return;
    animate(
      bar.current,
      { scale: [1, 1.06, 0.98, 1] },
      { duration: 0.45, ease: "easeOut" }
    );
  }, [landings, animate, bar]);

  return (
    <>
      {/* Keeps the end of the page clear of the fixed bar. */}
      <div className={visible ? "h-20" : "h-0"} aria-hidden />

      <AnimatePresence>
        {visible ? (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: "160%" }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "160%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 md:bottom-5"
          >
            <button
              ref={bar}
              id="cart-bar"
              type="button"
              onClick={() => setCartOpen(true)}
              className="bg-lime text-park mx-auto flex h-13 w-full max-w-md items-center justify-between gap-3 rounded-full pr-5 pl-5 shadow-[0_14px_30px_-12px_rgb(12_42_27/0.7)]"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <motion.span
                  key={itemCount}
                  initial={reduceMotion ? false : { scale: 1.35 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="tabular-nums"
                >
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </motion.span>
                <span className="opacity-60">·</span>
                View order
                <ArrowRight className="size-4" />
              </span>
              <span className="font-poster text-2xl leading-none font-black tabular-nums">
                {formatPrice(total, currency)}
              </span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} settings={settings} />
    </>
  );
}
