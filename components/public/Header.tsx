"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { motion } from "framer-motion";

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
        "sticky top-0 z-40 transition-all duration-500 ease-out",
        overHero
          ? "bg-linear-to-b from-black/55 via-black/25 to-transparent text-white"
          : "glass text-primary-foreground shadow-lift border-b border-white/10"
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="scene group flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            <motion.span
              className="relative block shrink-0"
              whileHover={{ rotateY: 18, rotateX: -8, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* A halo behind the mark so it reads as lit rather than pasted
                  on, on the photo and on the green bar alike. */}
              <span className="bg-sun/40 absolute -inset-1 rounded-full blur-md transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
              <Image
                src={logoUrl}
                alt={settings.cafe_name}
                width={40}
                height={40}
                className="ring-primary-foreground/25 relative size-10 rounded-full object-cover ring-2"
                priority
              />
            </motion.span>
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
            className="group/link relative text-inherit hover:bg-white/15 hover:text-inherit"
          >
            <Link href="/menu">
              Menu
              <span className="absolute inset-x-2.5 bottom-1 h-px origin-center scale-x-0 bg-current transition-transform duration-300 group-hover/link:scale-x-100" />
            </Link>
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
                "gap-1.5 rounded-full transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0",
                overHero
                  ? "border border-white/25 bg-white/15 text-white shadow-rest backdrop-blur hover:bg-white/25"
                  : "bg-primary-foreground text-primary shadow-rest hover:bg-primary-foreground/90"
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
