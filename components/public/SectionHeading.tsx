import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Poster style section heading: a small eyebrow, a big condensed headline,
 * and an optional link on the right ("Full menu →"). `tone="dark"` is for
 * headings sitting on the park green bands. `as` exists because a page's own
 * heading must be its h1 while home page sections are h2s.
 */
export function SectionHeading({
  eyebrow,
  children,
  action,
  as: Tag = "h2",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
  as?: ElementType;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-3",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={cn(
              "mb-2 text-xs font-bold tracking-[0.16em] uppercase",
              dark ? "text-lime" : "text-park/65"
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <Tag
          className={cn(
            "font-poster text-[2.6rem] leading-[0.9] font-black text-balance uppercase sm:text-6xl",
            dark ? "text-white" : "text-park"
          )}
        >
          {children}
        </Tag>
      </div>
      {action}
    </div>
  );
}

/** The "Full menu →" style link that sits beside a SectionHeading. */
export function HeadingLink({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "pb-1 text-sm font-bold underline-offset-4 group-hover:underline",
        tone === "dark" ? "text-lime" : "text-park"
      )}
    >
      {children}
    </span>
  );
}
