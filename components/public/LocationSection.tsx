import {
  ArrowUpRight,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from "lucide-react";

import { SectionHeading } from "@/components/public/SectionHeading";
import { clean, telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/**
 * Map, contact details and the way to the cafe's Google listing, all built
 * from the name, address and phone numbers in settings. The whole section
 * disappears when there is no address to show.
 *
 * Photos of the seating and the reviews already live on Google, so the
 * section links there rather than copying them: they stay current, and
 * nothing is shown that the cafe's guests did not write themselves.
 */
export function LocationSection({ settings }: { settings: SiteSettings }) {
  const address = clean(settings.address);
  if (!address) return null;

  const encoded = encodeURIComponent(address);
  const mapSrc = `https://www.google.com/maps?q=${encoded}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  const listing = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${settings.cafe_name}, ${address}`
  )}`;
  const hours = clean(settings.hours);
  const phone = clean(settings.phone_display);
  const call = telHref(settings.phone_display);
  const chat = whatsappHref(settings.phone_whatsapp);

  const outline =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-bold ring-1 ring-white/30 transition-colors ring-inset hover:bg-white/10";

  return (
    <section id="location" className="bg-park-2 scroll-mt-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div className="aspect-4/3 w-full overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 md:order-last">
          <iframe
            src={mapSrc}
            title={`Map to ${settings.cafe_name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="size-full border-0"
          />
        </div>

        <div className="grid gap-7">
          <SectionHeading tone="dark" eyebrow="Come sit with us">
            Find us
          </SectionHeading>

          <ul className="grid gap-3 text-[0.95rem]">
            <li className="flex gap-3">
              <MapPin className="text-lime mt-0.5 size-5 shrink-0" />
              <span className="text-pretty">{address}</span>
            </li>
            {hours ? (
              <li className="flex gap-3">
                <Clock className="text-lime mt-0.5 size-5 shrink-0" />
                <span>{hours}</span>
              </li>
            ) : null}
            {phone ? (
              <li className="flex gap-3">
                <Phone className="text-lime mt-0.5 size-5 shrink-0" />
                {call ? (
                  <a href={call} className="tabular-nums hover:underline">
                    {phone}
                  </a>
                ) : (
                  <span className="tabular-nums">{phone}</span>
                )}
              </li>
            ) : null}
          </ul>

          <div className="flex flex-wrap gap-3">
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-lime text-park inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-bold transition-[filter] hover:brightness-95"
            >
              <Navigation className="size-4" />
              Get directions
            </a>
            {call ? (
              <a href={call} className={outline}>
                <Phone className="size-4" />
                Call
              </a>
            ) : null}
            {chat ? (
              <a href={chat} target="_blank" rel="noopener noreferrer" className={outline}>
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            ) : null}
          </div>

          <a
            href={listing}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-park flex items-center gap-4 rounded-2xl p-4 ring-1 ring-white/10 transition-colors hover:ring-white/30"
          >
            <span className="bg-lime text-park grid size-12 shrink-0 place-items-center rounded-xl">
              <Star className="size-6 fill-current" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">Photos and reviews on Google</span>
              <span className="block text-sm text-white/65">
                See the park seating and what guests say about us.
              </span>
            </span>
            <ArrowUpRight className="text-lime size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
