import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
} from "@/components/public/SocialIcons";

import { clean, externalHref, telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/** Footer. Every row is omitted when its settings field is empty. */
export function Footer({ settings }: { settings: SiteSettings }) {
  const logoUrl = clean(settings.logo_url);
  const tagline = clean(settings.tagline);
  const address = clean(settings.address);
  const hours = clean(settings.hours);
  const phone = clean(settings.phone_display);
  const call = telHref(settings.phone_display);
  const instagram = externalHref(settings.instagram_url);
  const facebook = externalHref(settings.facebook_url);
  const year = new Date().getFullYear();

  return (
    <footer className="border-leaf/15 relative mt-16 border-t">
      {/* The page settles into deeper foliage at the very bottom. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--leaf) 12%, transparent))",
        }}
      />

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={settings.cafe_name}
              width={48}
              height={48}
              className="shadow-rest ring-leaf/20 size-12 shrink-0 rounded-full object-cover ring-2"
            />
          ) : null}
          <div>
            <p className="font-heading text-lg font-semibold">
              {settings.cafe_name}
            </p>
            {tagline ? (
              <p className="text-muted-foreground mt-1 text-sm">{tagline}</p>
            ) : null}
            {instagram || facebook ? (
              <div className="mt-3 flex gap-3">
                {instagram ? (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="bg-card shadow-rest text-muted-foreground hover:text-clay flex size-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1"
                  >
                    <InstagramIcon className="size-5" />
                  </a>
                ) : null}
                {facebook ? (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="bg-card shadow-rest text-muted-foreground hover:text-clay flex size-9 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1"
                  >
                    <FacebookIcon className="size-5" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <ul className="space-y-3 text-sm">
          {address ? (
            <li className="flex gap-2.5">
              <MapPin className="text-clay mt-0.5 size-4 shrink-0" />
              <span>{address}</span>
            </li>
          ) : null}
          {hours ? (
            <li className="flex gap-2.5">
              <Clock className="text-clay mt-0.5 size-4 shrink-0" />
              <span>{hours}</span>
            </li>
          ) : null}
          {phone ? (
            <li className="flex gap-2.5">
              <Phone className="text-clay mt-0.5 size-4 shrink-0" />
              {call ? (
                <a href={call} className="hover:underline">
                  {phone}
                </a>
              ) : (
                <span>{phone}</span>
              )}
            </li>
          ) : null}
        </ul>
      </div>

      <div className="text-muted-foreground border-leaf/15 border-t px-4 py-4 text-center text-xs">
        &copy; {year} {settings.cafe_name}
      </div>
    </footer>
  );
}
