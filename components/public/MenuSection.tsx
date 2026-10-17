"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { CategoryPicker } from "@/components/public/CategoryPicker";
import { MenuItemCard } from "@/components/public/MenuItemCard";
import { MenuItemRow } from "@/components/public/MenuItemRow";
import { SectionHeading } from "@/components/public/SectionHeading";
import { cn } from "@/lib/utils";
import type { CategoryWithItems } from "@/lib/types";

/** The selection pill gliding between categories: quick, with a soft landing. */
const PILL_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/**
 * The menu: a category list down the left on desktop, a pinned category picker
 * on mobile, and a staggered grid of items that cross fades on change.
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
  const listRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  const current =
    categories.find((category) => category.slug === active) ?? categories[0];
  const pillTransition = reduceMotion ? { duration: 0 } : PILL_SPRING;
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

  /**
   * Brings the top of the list back on screen. The category controls stay
   * pinned while the visitor scrolls, so a switch made far down the page would
   * otherwise land in the middle of the new list.
   */
  function revealList() {
    const list = listRef.current;
    if (!list) return;
    const clearance = parseFloat(getComputedStyle(list).scrollMarginTop) || 0;
    if (list.getBoundingClientRect().top < clearance) {
      list.scrollIntoView({ behavior, block: "start" });
    }
  }

  function choose(slug: string) {
    setActive(slug);
    revealList();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <FadeIn>
        <SectionHeading as="h1" eyebrow="Served all day">
          Our menu
        </SectionHeading>
      </FadeIn>

      {/* Mobile: one pinned bar that opens every category in a sheet. A
          sidebar would eat the width a 375px screen needs for the items, and
          a chip row hid most of the categories off to the side. */}
      <CategoryPicker
        categories={categories}
        current={current}
        onSelect={setActive}
        onSettled={revealList}
        className="bg-background/80 sticky top-16 z-30 -mx-4 mt-6 px-4 py-3 backdrop-blur-md lg:hidden"
      />

      <div className="mt-4 grid gap-8 lg:mt-8 lg:grid-cols-[230px_1fr]">
        {/* Desktop: the category list, sticky so it stays put while the
            cards scroll. */}
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
          <p className="text-clay px-3 text-xs font-semibold tracking-[0.18em] uppercase">
            Categories
          </p>

          <nav className="mt-3 space-y-1">
            {categories.map((category) => {
              const selected = category.slug === current.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => choose(category.slug)}
                  aria-current={selected}
                  className={cn(
                    "relative flex w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left text-sm font-medium transition-colors duration-300",
                    selected
                      ? "text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="menu-category"
                      transition={pillTransition}
                      className="bg-primary shadow-lift absolute inset-0 rounded-full"
                    />
                  ) : null}
                  <span className="relative truncate">{category.name}</span>
                  <span
                    className={cn(
                      "relative shrink-0 text-xs tabular-nums",
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

        {/* Scroll margin clears whatever is pinned above the list: header and
            picker on mobile, the header alone on desktop. */}
        <div ref={listRef} className="min-w-0 scroll-mt-36 lg:scroll-mt-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h2 className="font-heading mb-4 flex items-center gap-3 text-lg font-semibold sm:mb-6 lg:text-xl">
                <span className="bg-clay/70 h-5 w-1 rounded-full" />
                {current.name}
              </h2>

              {/* Rows on phones, cards from `sm` up. Both are rendered and one
                  is hidden in CSS, so the switch never flashes on hydration;
                  the hidden one's lazy images are never fetched. */}
              <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {current.items.map((item) => (
                  <StaggerItem key={item.id}>
                    <MenuItemRow
                      item={item}
                      currency={currency}
                      className="sm:hidden"
                    />
                    <MenuItemCard
                      item={item}
                      currency={currency}
                      className="hidden sm:block"
                    />
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
