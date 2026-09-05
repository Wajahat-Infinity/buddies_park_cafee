import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Section heading with a sprig rule and a small eyebrow above it. Shared so
 * "Popular right now" and "Our menu" carry identical rhythm; `as` exists
 * because the menu page needs its heading to be the page's h1 while the home
 * page sections are h2s.
 */
export function SectionHeading({
  eyebrow,
  children,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      {eyebrow ? (
        <p className="text-clay mb-2 text-xs font-semibold tracking-[0.22em] uppercase">
          {eyebrow}
        </p>
      ) : null}

      <div className="leaf-rule">
        <Tag className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {children}
        </Tag>
      </div>
    </div>
  );
}
