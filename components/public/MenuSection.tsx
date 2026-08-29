"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { MenuItemCard } from "@/components/public/MenuItemCard";
import { cn } from "@/lib/utils";
import type { CategoryWithItems } from "@/lib/types";

/**
 * The menu: a category list down the left on desktop, a scrollable row of
 * chips on mobile, and a staggered grid of cards that cross fades on change.
 */
export function MenuSection({
  categories,
  currency,
}: {
  categories: CategoryWithItems[];
  currency: string;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(categories[0]?.slug ?? "");

  if (categories.length === 0) return null;

  const current =
    categories.find((category) => category.slug === active) ?? categories[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <FadeIn>
        <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Our menu
        </h1>
      </FadeIn>

      {/* Mobile: a scrolling row of chips. A sidebar would eat the width a
          375px screen needs for the cards. */}
      <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-1 lg:hidden">
        <div className="flex w-max gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.slug)}
              aria-current={category.slug === current.slug}
              className={cn(
                "h-11 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors",
                category.slug === current.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[230px_1fr]">
        {/* Desktop: the category list, sticky so it stays put while the
            cards scroll. */}
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
          <p className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
            Categories
          </p>

          <nav className="mt-3 space-y-1">
            {categories.map((category) => {
              const selected = category.slug === current.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActive(category.slug)}
                  aria-current={selected}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="truncate">{category.name}</span>
                  <span
                    className={cn(
                      "shrink-0 text-xs tabular-nums",
                      selected ? "opacity-80" : "text-muted-foreground"
                    )}
                  >
                    {category.items.length}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h2 className="mb-5 text-lg font-semibold lg:text-xl">
                {current.name}
              </h2>

              <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {current.items.map((item) => (
                  <StaggerItem key={item.id}>
                    <MenuItemCard item={item} currency={currency} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
