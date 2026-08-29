"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clean, telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/**
 * Sticky header. On the home page it sits transparently over the hero
 * carousel and turns solid once the page scrolls; everywhere else it is solid
 * from the start, since there is no hero behind it.
 */
export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = pathname === "/" && !scrolled;

  const logoUrl = clean(settings.logo_url);
  const tagline = clean(settings.tagline);
  const call = telHref(settings.phone_display);
  const chat = whatsappHref(settings.phone_whatsapp, settings.whatsapp_greeting);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        overHero
          ? "bg-linear-to-b from-black/60 via-black/30 to-transparent text-white"
          : "bg-primary text-primary-foreground shadow-sm backdrop-blur"
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={settings.cafe_name}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
              priority
            />
          ) : null}
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-base leading-tight font-semibold sm:text-lg",
                overHero && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              )}
            >
              {settings.cafe_name}
            </span>
            {tagline ? (
              <span className="hidden truncate text-xs opacity-80 sm:block">
                {tagline}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-inherit hover:bg-white/15 hover:text-inherit"
          >
            <Link href="/menu">Menu</Link>
          </Button>

          {call ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Call us"
              className="text-inherit hover:bg-white/15 hover:text-inherit"
            >
              <a href={call}>
                <Phone className="size-5" />
              </a>
            </Button>
          ) : null}

          {chat ? (
            <Button
              asChild
              size="sm"
              className={cn(
                "gap-1.5",
                overHero
                  ? "bg-white/15 text-white backdrop-blur hover:bg-white/25"
                  : "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              )}
            >
              <a href={chat} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
