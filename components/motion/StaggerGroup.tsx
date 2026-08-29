"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useRevealFallback } from "@/components/motion/FadeIn";

/**
 * Wrap a list in StaggerGroup and each child in StaggerItem to reveal them in
 * sequence as the group enters the viewport.
 */
export function StaggerGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();
  const forced = useRevealFallback();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={forced ? "visible" : undefined}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: reduceMotion ? 0 : stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
        visible: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
