import { clean } from "@/lib/format";

/**
 * The cafe's own clock. Open now has to be judged in the cafe's time, not the
 * visitor's: someone checking from abroad should still see whether the doors
 * in Rawalpindi are open.
 */
export const CAFE_TIME_ZONE = "Asia/Karachi";

/** Minutes since midnight. `close` at or before `open` runs past midnight. */
export type DailyHours = { open: number; close: number };

const TIME = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b(noon|midnight)\b/gi;
const DAY_NAME = /\b(mon|tue|wed|thu|fri|sat|sun)/i;

function toMinutes(match: RegExpMatchArray): number {
  const word = match[4]?.toLowerCase();
  if (word === "noon") return 12 * 60;
  if (word === "midnight") return 0;
  const hour = Number(match[1]) % 12;
  const minute = Number(match[2] ?? 0);
  return (hour + (match[3].toLowerCase() === "pm" ? 12 : 0)) * 60 + minute;
}

/**
 * Reads the free text hours setting, but only when it is one daily window
 * such as "Daily, 12pm to 12am". A schedule that names days ("Mon to Thu…")
 * returns null: guessing open or closed wrong is worse than not saying.
 */
export function parseDailyHours(hours: string | null | undefined): DailyHours | null {
  const text = clean(hours);
  if (!text || DAY_NAME.test(text)) return null;

  const times = [...text.matchAll(TIME)].map(toMinutes);
  if (times.length !== 2) return null;
  return { open: times[0], close: times[1] };
}

/** "12 am", "9:30 pm". */
export function formatClock(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const suffix = hour < 12 ? "am" : "pm";
  const shown = hour % 12 === 0 ? 12 : hour % 12;
  return minute ? `${shown}:${String(minute).padStart(2, "0")} ${suffix}` : `${shown} ${suffix}`;
}

/** Current minutes since midnight at the cafe. */
export function cafeMinutesNow(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAFE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function isOpenAt(hours: DailyHours, minutes: number): boolean {
  if (hours.open === hours.close) return true;
  return hours.close > hours.open
    ? minutes >= hours.open && minutes < hours.close
    : minutes >= hours.open || minutes < hours.close;
}
