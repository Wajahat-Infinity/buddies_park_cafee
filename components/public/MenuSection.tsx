"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { CategoryPicker } from "@/components/public/CategoryPicker";
import { MenuItemCard } from "@/components/public/MenuItemCard";
import { MenuItemRow } from "@/components/public/MenuItemRow";
import { cn } from "@/lib/utils";
import type { CategoryWithItems } from "@/lib/types";

/** The selection pill gliding between categories: quick, with a soft landing. */
const PILL_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/**
 * The menu: a park green title band, then a category list down the left on
 * desktop or a pinned category picker on mobile, and a staggered grid of
 * items that cross fades on change. `initialSlug` opens a given category,
 * which is how the home page's category tiles land.
 */
export function MenuSection({
  categories,
  currency,
  initialSlug,
}: {
  categories: CategoryWithItems[];
  currency: string;
  initialSlug?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(
    categories.some((category) => category.slug === initialSlug)
      ? initialSlug!
      : categories[0]?.slug ?? ""
  );
  const listRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  const current =
    categories.find((category) => category.slug === active) ?? categories[0];
  const pillTransition = reduceMotion ? { duration: 0 } : PILL_SPRING;
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
  const itemTotal = categories.reduce(
    (sum, category) => sum + category.items.length,
    0
  );

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
    <>
      <div className="bg-park text-white">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8">
          <p className="text-lime mb-2 text-xs font-bold tracking-[0.16em] uppercase">
            Served all day
          </p>
          <h1 className="font-poster text-6xl leading-[0.9] font-black uppercase sm:text-7xl">
            Our menu
          </h1>
          <p className="mt-2 text-sm font-semibold text-white/60 tabular-nums">
            {categories.length} categories · {itemTotal} items
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        {/* Mobile: one pinned bar that opens every category in a sheet. A
            sidebar would eat the width a 375px screen needs for the items. */}
        <CategoryPicker
          categories={categories}
          current={current}
          onSelect={setActive}
          onSettled={revealList}
          className="bg-paper/90 sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-md lg:hidden"
        />

        <div className="mt-2 grid gap-10 lg:mt-10 lg:grid-cols-[240px_1fr]">
          {/* Desktop: the category list, sticky so it stays put while the
              cards scroll. */}
          <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
            <p className="text-park/60 px-4 text-xs font-bold tracking-[0.16em] uppercase">
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
                      "relative flex w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left text-sm font-bold transition-colors duration-300",
                      selected ? "text-lime" : "text-park hover:bg-park/5"
                    )}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="menu-category"
                        transition={pillTransition}
                        className="bg-park absolute inset-0 rounded-full"
                      />
                    ) : null}
                    <span className="relative truncate">{category.name}</span>
                    <span
                      className={cn(
                        "relative shrink-0 text-xs tabular-nums",
                        selected ? "text-white/70" : "text-park/50"
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
                <h2 className="font-poster mb-4 text-3xl leading-none font-black uppercase sm:mb-6 sm:text-4xl">
                  {current.name}
                </h2>

                {/* Rows on phones, cards from `sm` up. Both are rendered and one
                    is hidden in CSS, so the switch never flashes on hydration;
                    the hidden one's lazy images are never fetched. */}
                <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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
                        className="hidden sm:flex"
                      />
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
