import { formatPrice } from "@/lib/format";
import type { Deal } from "@/lib/types";

/** Enough copies of the deal list that one half of the track outruns any screen. */
const MIN_ENTRIES_PER_HALF = 8;

/**
 * A lime band running every active deal and its price, like the strip along
 * the bottom of a printed flyer. Decorative repetition of the deals section
 * below it, so it is hidden from screen readers rather than read out twice.
 */
export function DealsTicker({
  deals,
  currency,
}: {
  deals: Deal[];
  currency: string;
}) {
  if (deals.length === 0) return null;

  const copies = Math.max(1, Math.ceil(MIN_ENTRIES_PER_HALF / deals.length));
  const half = Array.from({ length: copies }, () => deals).flat();
  // Roughly four seconds per entry keeps every price readable as it passes.
  const duration = `${half.length * 4}s`;

  const run = (key: string) => (
    <div key={key} className="flex shrink-0">
      {half.map((deal, index) => (
        <span key={`${deal.id}-${index}`} className="flex items-center">
          <span className="px-5">
            {deal.name}{" "}
            <span className="text-park/55">
              {formatPrice(deal.price, currency)}
            </span>
          </span>
          <span className="text-park/40">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden className="ticker bg-lime text-park overflow-hidden py-3">
      <div
        className="ticker-track font-poster flex w-max text-2xl leading-none font-black whitespace-nowrap uppercase sm:text-3xl"
        style={{ ["--ticker-duration" as string]: duration }}
      >
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}
