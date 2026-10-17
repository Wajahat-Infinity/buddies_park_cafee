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

  const social =
    "bg-park-2 grid size-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-lime hover:text-park";

  return (
    <footer className="bg-park text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2">
        <div className="flex items-start gap-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={settings.cafe_name}
              width={64}
              height={64}
              className="ring-lime size-16 shrink-0 rounded-full object-cover ring-2"
            />
          ) : null}
          <div>
            <p className="font-poster text-3xl leading-none font-black uppercase">
              {settings.cafe_name}
            </p>
            {tagline ? (
              <p className="text-lime mt-2 text-sm font-semibold">{tagline}</p>
            ) : null}
            {instagram || facebook ? (
              <div className="mt-4 flex gap-2">
                {instagram ? (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={social}
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
                    className={social}
                  >
                    <FacebookIcon className="size-5" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <ul className="grid content-start gap-3 text-sm text-white/80">
          {address ? (
            <li className="flex gap-3">
              <MapPin className="text-lime mt-0.5 size-4 shrink-0" />
              <span>{address}</span>
            </li>
          ) : null}
          {hours ? (
            <li className="flex gap-3">
              <Clock className="text-lime mt-0.5 size-4 shrink-0" />
              <span>{hours}</span>
            </li>
          ) : null}
          {phone ? (
            <li className="flex gap-3">
              <Phone className="text-lime mt-0.5 size-4 shrink-0" />
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
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        &copy; {year} {settings.cafe_name}
      </div>
    </footer>
  );
}
