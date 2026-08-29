"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clean, telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/** Sticky header. Logo, name and contact links all come from settings. */
export function Header({ settings }: { settings: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logoUrl = clean(settings.logo_url);
  const tagline = clean(settings.tagline);
  const call = telHref(settings.phone_display);
  const chat = whatsappHref(settings.phone_whatsapp, settings.whatsapp_greeting);

  return (
    <header
      className={cn(
        "bg-background/90 sticky top-0 z-40 backdrop-blur transition-shadow duration-300",
        scrolled ? "shadow-sm" : "shadow-none"
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
            <span className="block truncate text-base leading-tight font-semibold sm:text-lg">
              {settings.cafe_name}
            </span>
            {tagline ? (
              <span className="text-muted-foreground hidden truncate text-xs sm:block">
                {tagline}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Button asChild variant="ghost" size="sm">
            <Link href="/menu">Menu</Link>
          </Button>
          {call ? (
            <Button asChild variant="ghost" size="icon" aria-label="Call us">
              <a href={call}>
                <Phone className="size-5" />
              </a>
            </Button>
          ) : null}
          {chat ? (
            <Button asChild size="sm" className="gap-1.5">
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
