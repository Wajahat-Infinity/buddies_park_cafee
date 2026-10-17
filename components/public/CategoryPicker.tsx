"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, UtensilsCrossed } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { clean } from "@/lib/format";
import type { CategoryWithItems } from "@/lib/types";

/** The first photo in a category stands in as its icon; categories have none. */
function thumbnailOf(category: CategoryWithItems) {
  for (const item of category.items) {
    const url = clean(item.image_url);
    if (url) return url;
  }
  return null;
}

function Thumb({
  category,
  className,
}: {
  category: CategoryWithItems;
  className?: string;
}) {
  const url = thumbnailOf(category);
  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground relative flex shrink-0 items-center justify-center overflow-hidden",
        className
      )}
    >
      {url ? (
        <Image src={url} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <UtensilsCrossed className="size-4" />
      )}
    </span>
  );
}

/**
 * Mobile category switcher: one pinned bar naming the current category, which
 * opens a bottom sheet holding every category at once. Replaces a sideways
 * scrolling chip row, which hid most of the nine categories off screen.
 *
 * `onSelect` fires on the tap, so the list behind the sheet is already
 * changing as it closes; `onSettled` fires once the sheet has gone, which is
 * the first moment the page can be scrolled to the new list.
 */
export function CategoryPicker({
  categories,
  current,
  onSelect,
  onSettled,
  className,
}: {
  categories: CategoryWithItems[];
  current: CategoryWithItems;
  onSelect: (slug: string) => void;
  onSettled: () => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const chose = useRef(false);
  const itemTotal = categories.reduce(
    (sum, category) => sum + category.items.length,
    0
  );

  function choose(slug: string) {
    chose.current = true;
    onSelect(slug);
    setOpen(false);
  }

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="bg-card shadow-rest flex h-13 w-full items-center gap-3 rounded-full border py-1.5 pr-1.5 pl-1.5 text-left transition-transform active:scale-[0.99]"
      >
        <Thumb category={current} className="size-10 rounded-full" />

        <span className="min-w-0 flex-1">
          <span className="text-clay block text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
            Category
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.slug}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="block truncate text-sm leading-tight font-semibold"
            >
              {current.name}
            </motion.span>
          </AnimatePresence>
        </span>

        <span className="bg-primary text-primary-foreground flex h-10 shrink-0 items-center gap-1 rounded-full pr-3 pl-4 text-xs font-semibold">
          All {categories.length}
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-0 rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))]"
          onCloseAutoFocus={(event) => {
            // Return focus by hand, without letting the browser scroll to the
            // pinned trigger, then let the page move to the chosen list.
            event.preventDefault();
            triggerRef.current?.focus({ preventScroll: true });
            if (chose.current) {
              chose.current = false;
              onSettled();
            }
          }}
        >
          <div aria-hidden className="bg-border mx-auto mt-3 h-1.5 w-12 rounded-full" />

          <SheetHeader className="pb-2 text-center">
            <SheetTitle className="text-lg font-semibold">
              Choose a category
            </SheetTitle>
            <SheetDescription>
              {categories.length} categories · {itemTotal} items
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-2.5 overflow-y-auto px-4 pt-1 pb-2">
            {categories.map((category, index) => {
              const selected = category.slug === current.slug;
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => choose(category.slug)}
                  aria-current={selected}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: reduceMotion ? 0 : 0.04 + index * 0.025,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "flex min-h-16 items-center gap-2.5 rounded-2xl border p-2 text-left transition-colors active:scale-[0.98]",
                    selected
                      ? "bg-primary text-primary-foreground border-primary shadow-lift"
                      : "bg-card shadow-rest hover:bg-muted"
                  )}
                >
                  <Thumb category={category} className="size-11 rounded-xl" />
                  <span className="min-w-0">
                    <span className="block text-sm leading-tight font-semibold text-balance">
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-xs tabular-nums",
                        selected ? "opacity-80" : "text-muted-foreground"
                      )}
                    >
                      {category.items.length}{" "}
                      {category.items.length === 1 ? "item" : "items"}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
