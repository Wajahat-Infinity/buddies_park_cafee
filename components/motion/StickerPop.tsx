"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * A price sticker slapped on once, the first time it scrolls into view. It
 * starts small and tilted but always fully visible, so a reveal that never
 * fires still leaves a readable price.
 */
export function StickerPop({
  children,
  className,
  rotate = -3,
}: {
  children: ReactNode;
  className?: string;
  /** Resting tilt in degrees. */
  rotate?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("brush bg-lime text-park", className)}
      initial={reduceMotion ? { rotate } : { scale: 0.7, rotate: rotate - 9 }}
      whileInView={{ scale: 1, rotate }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ type: "spring", stiffness: 420, damping: 14 }}
    >
      {children}
    </motion.div>
  );
}
