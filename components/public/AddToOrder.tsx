"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

/**
 * The add button, which turns into a quantity stepper once the item is in the
 * cart. Shared by the menu card and the compact mobile row so both behave
 * identically; `compact` only changes how much room it takes.
 *
 * Adding goes through `onAdd` rather than the cart directly, so the caller can
 * pair it with the fly to cart animation from its own photo.
 */
export function AddToOrder({
  id,
  name,
  soldOut,
  onAdd,
  compact = false,
}: {
  id: string;
  name: string;
  soldOut: boolean;
  onAdd: () => void;
  compact?: boolean;
}) {
  const { increment, decrement, quantityOf } = useCart();
  const quantity = quantityOf(id);
  const stepSize = compact ? "size-7" : "size-8";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {quantity > 0 && !soldOut ? (
        <motion.div
          key="stepper"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "bg-secondary/60 flex items-center gap-2 rounded-full border p-1",
            compact ? "gap-1" : "justify-between"
          )}
        >
          <Button
            size="icon"
            variant="ghost"
            className={cn(stepSize, "rounded-full transition-transform active:scale-90")}
            onClick={() => decrement(id)}
            aria-label={`Remove one ${name}`}
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
            className={cn(stepSize, "rounded-full transition-transform active:scale-90")}
            onClick={() => increment(id)}
            aria-label={`Add one more ${name}`}
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
            size={compact ? "sm" : "lg"}
            className={cn(
              "rounded-full",
              compact ? "h-9 px-4" : "h-10 w-full",
              !soldOut && "press-3d"
            )}
            disabled={soldOut}
            onClick={onAdd}
            aria-label={compact && !soldOut ? `Add ${name} to order` : undefined}
          >
            {soldOut ? (
              compact ? "Sold out" : "Unavailable"
            ) : (
              <>
                <Plus className="size-4" />
                {compact ? "Add" : "Add to order"}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
