"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { useCart } from "@/context/CartContext";

/**
 * The round lime add button, which turns into a quantity stepper once the item
 * is in the cart. Shared by the menu card and the compact phone row so both
 * behave identically.
 *
 * Adding goes through `onAdd` rather than the cart directly, so the caller can
 * pair it with the fly to cart animation from its own photo.
 */
export function AddToOrder({
  id,
  name,
  soldOut,
  onAdd,
}: {
  id: string;
  name: string;
  soldOut: boolean;
  onAdd: () => void;
}) {
  const { increment, decrement, quantityOf } = useCart();
  const quantity = quantityOf(id);

  if (soldOut) {
    return (
      <span className="bg-park/8 text-park/60 rounded-full px-3 py-2 text-xs font-bold">
        Sold out
      </span>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {quantity > 0 ? (
        <motion.div
          key="stepper"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="bg-park flex items-center gap-1 rounded-full p-1 text-white"
        >
          <button
            type="button"
            onClick={() => decrement(id)}
            aria-label={`Remove one ${name}`}
            className="bg-park-2 grid size-8 place-items-center rounded-full transition-transform active:scale-90"
          >
            <Minus className="size-4" strokeWidth={2.75} />
          </button>
          <span
            aria-live="polite"
            className="min-w-6 text-center text-sm font-extrabold tabular-nums"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => increment(id)}
            aria-label={`Add one more ${name}`}
            className="bg-lime text-park grid size-8 place-items-center rounded-full transition-transform active:scale-90"
          >
            <Plus className="size-4" strokeWidth={2.75} />
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="add"
          type="button"
          onClick={onAdd}
          aria-label={`Add ${name} to order`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="bg-lime text-park shadow-card grid size-10 place-items-center rounded-full transition-[transform,filter] hover:brightness-95 active:scale-90"
        >
          <Plus className="size-5" strokeWidth={2.75} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
