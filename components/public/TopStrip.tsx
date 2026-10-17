"use client";

import { useEffect, useState } from "react";

import { clean } from "@/lib/format";
import {
  cafeMinutesNow,
  formatClock,
  isOpenAt,
  parseDailyHours,
} from "@/lib/hours";
import type { SiteSettings } from "@/lib/types";

/**
 * Lime strip above the header: open or closed right now, worked out from the
 * hours setting. Renders the plain hours text until it has mounted, because
 * the server cannot know the visitor's moment and a mismatch would flicker.
 */
export function TopStrip({ settings }: { settings: SiteSettings }) {
  const hoursText = clean(settings.hours);
  const address = clean(settings.address);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(
    null
  );

  useEffect(() => {
    const hours = parseDailyHours(settings.hours);
    if (!hours) return;

    const update = () => {
      const open = isOpenAt(hours, cafeMinutesNow());
      setStatus({
        open,
        label: open
          ? `Open now · till ${formatClock(hours.close)}`
          : `Closed · opens at ${formatClock(hours.open)}`,
      });
    };
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [settings.hours]);

  if (!hoursText && !address) return null;

  return (
    <div className="bg-lime text-park">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 text-[0.7rem] font-bold tracking-[0.08em] uppercase">
        <span className="flex min-w-0 items-center gap-2">
          {status ? (
            <span
              aria-hidden
              className={
                status.open
                  ? "bg-park size-1.5 shrink-0 rounded-full"
                  : "bg-chili size-1.5 shrink-0 rounded-full"
              }
            />
          ) : null}
          <span className="truncate">{status?.label ?? hoursText}</span>
        </span>
        {address ? (
          <span className="hidden truncate opacity-75 sm:block">{address}</span>
        ) : null}
      </div>
    </div>
  );
}
