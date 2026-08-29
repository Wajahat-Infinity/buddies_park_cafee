"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { MenuItemCard } from "@/components/public/MenuItemCard";
import type { CategoryWithItems } from "@/lib/types";

/**
 * The menu itself: category tabs with a cross fading panel and a staggered
 * grid of cards.
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
    <section id="menu" className="mx-auto max-w-5xl scroll-mt-16 px-4 py-12">
      <FadeIn>
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Our menu
        </h2>
      </FadeIn>

      <Tabs value={current.slug} onValueChange={setActive} className="mt-6">
        <TabsList className="mx-auto flex w-full max-w-full justify-start overflow-x-auto sm:w-auto sm:justify-center">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.slug}
              className="shrink-0"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <StaggerGroup className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {current.items.map((item) => (
              <StaggerItem key={item.id}>
                <MenuItemCard item={item} currency={currency} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
