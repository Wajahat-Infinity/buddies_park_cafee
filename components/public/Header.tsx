"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { clean, telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/types";

/** Desktop links. On phones the same places live in the bottom tab bar. */
const NAV_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/deals", label: "Deals" },
  { href: "/#location", label: "Find us" },
] as const;

/**
 * Sticky park green header on every public page. The logo and name always,
 * an order button always; the page links and the cart only from `md` up,
 * since phones get them in the bottom tab bar where a thumb can reach.
 */
export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const { itemCount, setCartOpen } = useCart();

  const logoUrl = clean(settings.logo_url);
  const tagline = clean(settings.tagline);
  const phone = clean(settings.phone_display);
  const call = telHref(settings.phone_display);
  const chat = whatsappHref(settings.phone_whatsapp, settings.whatsapp_greeting);

  return (
    <header className="bg-park sticky top-0 z-40 text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={settings.cafe_name}
              width={40}
              height={40}
              className="ring-lime size-10 shrink-0 rounded-full object-cover ring-2"
              loading="eager"
            />
          ) : null}
          <span className="min-w-0">
            <span className="font-poster block text-xl leading-[0.95] font-black tracking-wide uppercase max-sm:line-clamp-2 sm:truncate sm:text-2xl">
              {settings.cafe_name}
            </span>
            {tagline ? (
              <span className="text-lime hidden truncate text-xs font-semibold sm:block">
                {tagline}
              </span>
            ) : null}
          </span>
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const current = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                  current ? "text-lime" : "text-white/75 hover:text-white"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {phone && call ? (
            <a
              href={call}
              className="hidden px-2 text-sm font-semibold text-white/75 tabular-nums hover:text-white lg:block"
            >
              {phone}
            </a>
          ) : null}

          {chat ? (
            <a
              href={chat}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-lime text-park inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold transition-[filter] hover:brightness-95"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Your order, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className="bg-park-2 relative hidden size-10 place-items-center rounded-full transition-colors hover:bg-white/15 md:grid"
          >
            <ShoppingBag className="size-5" />
            {itemCount > 0 ? (
              <span className="bg-lime text-park absolute -top-1 -right-1 min-w-5 rounded-full px-1.5 py-0.5 text-center text-[0.7rem] leading-none font-extrabold tabular-nums">
                {itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
