import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
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
    <section id="location" className="scroll-mt-16 border-t">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <FadeIn>
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Find us
          </h2>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-6">
          <div className="bg-muted aspect-4/3 w-full overflow-hidden rounded-xl border sm:aspect-21/9">
            <iframe
              src={mapSrc}
              title={`Map to ${settings.cafe_name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="size-full border-0"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <span className="text-pretty">{address}</span>
              </li>
              {hours ? (
                <li className="flex gap-2.5">
                  <Clock className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <span>{hours}</span>
                </li>
              ) : null}
              {phone ? (
                <li className="flex gap-2.5">
                  <Phone className="text-muted-foreground mt-0.5 size-4 shrink-0" />
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
              <Button asChild size="lg">
                <a href={directions} target="_blank" rel="noopener noreferrer">
                  <Navigation className="size-4" />
                  Get directions
                </a>
              </Button>

              {call ? (
                <Button asChild size="lg" variant="outline">
                  <a href={call}>
                    <Phone className="size-4" />
                    Call us
                  </a>
                </Button>
              ) : null}

              {chat ? (
                <Button asChild size="lg" variant="outline">
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
