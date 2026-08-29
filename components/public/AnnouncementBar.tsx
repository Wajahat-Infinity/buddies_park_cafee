"use client";

import { motion, useReducedMotion } from "framer-motion";

import { clean } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/**
 * Thin bar above the header. Renders nothing at all unless the owner has both
 * written an announcement and switched it on.
 */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const reduceMotion = useReducedMotion();
  const text = clean(settings.announcement_text);

  if (!settings.announcement_active || !text) return null;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
      animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-primary text-primary-foreground overflow-hidden"
    >
      <p className="mx-auto max-w-5xl px-4 py-2 text-center text-xs font-medium sm:text-sm">
        {text}
      </p>
    </motion.div>
  );
}
