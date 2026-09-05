import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { SectionHeading } from "@/components/public/SectionHeading";
import { clean, telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/**
 * Map and contact details, all built from the address and phone numbers in
 * settings. The whole section disappears when there is no address to show.
 */
export function LocationSection({ settings }: { settings: SiteSettings }) {
  const address = clean(settings.address);
  if (!address) return null;

  const encoded = encodeURIComponent(address);
  const mapSrc = `https://www.google.com/maps?q=${encoded}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  const hours = clean(settings.hours);
  const phone = clean(settings.phone_display);
  const call = telHref(settings.phone_display);
  const chat = whatsappHref(settings.phone_whatsapp);

  return (
    <section id="location" className="border-leaf/15 scroll-mt-16 border-t">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <FadeIn>
          <SectionHeading eyebrow="Come sit with us">Find us</SectionHeading>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-8">
          <div className="shadow-float bg-muted aspect-4/3 w-full overflow-hidden rounded-2xl border p-1 sm:aspect-21/9">
            <iframe
              src={mapSrc}
              title={`Map to ${settings.cafe_name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="size-full rounded-xl border-0"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <ul className="surface-3d space-y-3 rounded-2xl border p-5 text-sm">
              <li className="flex gap-2.5">
                <MapPin className="text-clay mt-0.5 size-4 shrink-0" />
                <span className="text-pretty">{address}</span>
              </li>
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

            <div className="flex flex-col gap-2.5">
              <Button asChild size="lg" className="press-3d h-11 rounded-full">
                <a href={directions} target="_blank" rel="noopener noreferrer">
                  <Navigation className="size-4" />
                  Get directions
                </a>
              </Button>

              {call ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="shadow-rest h-11 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <a href={call}>
                    <Phone className="size-4" />
                    Call us
                  </a>
                </Button>
              ) : null}

              {chat ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="shadow-rest h-11 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <a href={chat} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" />
                    Chat on WhatsApp
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
