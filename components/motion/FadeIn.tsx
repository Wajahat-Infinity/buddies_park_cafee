"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Safety net: if the viewport observer never fires (slow phone, blocked or
 * failed hydration), content must never stay invisible. After this delay the
 * reveal is forced regardless.
 */
const REVEAL_FALLBACK_MS = 1200;

export function useRevealFallback() {
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setForced(true), REVEAL_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);
  return forced;
}

/**
 * Reveals its children once, when they scroll into view. Under reduced motion
 * the movement is dropped and only opacity changes.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const forced = useRevealFallback();
  const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={forced ? shown : undefined}
      whileInView={shown}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
