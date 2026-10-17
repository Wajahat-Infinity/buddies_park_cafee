import Link from "next/link";
import { Clock, MapPin, ShoppingBag } from "lucide-react";

import { HeroArt, type HeroSlide } from "@/components/public/HeroArt";
import { clean, formatPrice } from "@/lib/format";
import type { CarouselSlide, Deal, MenuItem, SiteSettings } from "@/lib/types";

/**
 * Breaks the headline into poster lines, one per phrase, with the last set in
 * lime: "Good food, / good company, / by the park". Without commas, the final
 * word alone goes lime.
 */
function headlineLines(text: string): string[] {
  const phrases = text.split(/(?<=,)\s+/).filter(Boolean);
  if (phrases.length > 1) return phrases;
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return [text];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

/** First line of the address, short enough to sit in the facts row. */
function shortAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(", ") : address;
}

/**
 * The home page opener: what the cafe is, how to order, and the strongest
 * reasons to order today. The photo cycles through every active deal with a
 * photo, in the admin's deal order. With no deals it cycles through the
 * carousel slides instead, and with neither it shows a featured item.
 */
export function HomeHero({
  settings,
  deals,
  carousel,
  featured,
}: {
  settings: SiteSettings;
  deals: Deal[];
  carousel: CarouselSlide[];
  featured: MenuItem[];
}) {
  const headline = clean(settings.tagline) ?? settings.cafe_name;
  const lines = headlineLines(headline);
  const hours = clean(settings.hours);
  const address = clean(settings.address);

  const extras = featured
    .map((item) => clean(item.image_url))
    .filter((url): url is string => Boolean(url))
    .slice(0, 2);

  const dealSlides: HeroSlide[] = deals.flatMap((deal) => {
    const image = clean(deal.image_url);
    return image
      ? [
          {
            id: deal.id,
            image,
            alt: deal.name,
            sticker: {
              top: deal.name,
              main: formatPrice(deal.price, settings.currency),
              size: "price" as const,
            },
          },
        ]
      : [];
  });
  // The owner's own photos: a new item, an event, the park seating. The
  // title goes on the sticker, the subtitle above it.
  const carouselSlides: HeroSlide[] = carousel.flatMap((slide) => {
    const image = clean(slide.image_url);
    const title = clean(slide.title);
    const subtitle = clean(slide.subtitle);
    return image
      ? [
          {
            id: slide.id,
            image,
            alt: title ?? "",
            sticker: title
              ? { top: subtitle ?? undefined, main: title, size: "text" as const }
              : undefined,
          },
        ]
      : [];
  });

  // Last resort, a featured item's photo, taken out of the small round
  // photos so it is not shown twice.
  const slides: HeroSlide[] =
    dealSlides.length > 0
      ? dealSlides
      : carouselSlides.length > 0
        ? carouselSlides
        : extras.length > 0
          ? [{ id: "hero", image: extras.shift()!, alt: "" }]
          : [];

  return (
    <section className="bg-park overflow-hidden text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 md:grid-cols-[1.15fr_0.85fr] md:pt-16 md:pb-24">
        <div>
          <h1 className="font-poster text-[3.4rem] leading-[0.86] font-black uppercase sm:text-7xl lg:text-[5.75rem]">
            {lines.map((line, index) => (
              <span
                key={index}
                className={index === lines.length - 1 ? "text-lime block" : "block"}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-md text-base text-white/75 sm:text-lg">
            Pick your food here and send the order on WhatsApp. No app, no
            sign up.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="bg-lime text-park inline-flex h-12 items-center rounded-full px-7 font-bold transition-[filter] hover:brightness-95"
            >
              Order now
            </Link>
            {deals.length > 0 ? (
              <Link
                href="/deals"
                className="inline-flex h-12 items-center rounded-full px-7 font-bold ring-1 ring-white/40 transition-colors ring-inset hover:bg-white/10"
              >
                See deals
              </Link>
            ) : null}
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/70">
            {hours ? (
              <li className="flex items-center gap-2">
                <Clock className="text-lime size-4 shrink-0" />
                {hours}
              </li>
            ) : null}
            {address ? (
              <li className="flex items-center gap-2">
                <MapPin className="text-lime size-4 shrink-0" />
                {shortAddress(address)}
              </li>
            ) : null}
            <li className="flex items-center gap-2">
              <ShoppingBag className="text-lime size-4 shrink-0" />
              Pickup or delivery
            </li>
          </ul>
        </div>

        {slides.length > 0 ? <HeroArt slides={slides} extras={extras} /> : null}
      </div>
    </section>
  );
}
