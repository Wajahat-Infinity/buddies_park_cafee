import type { Metadata } from "next";
import { Big_Shoulders, Figtree, Geist, Geist_Mono, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSettings } from "@/lib/queries";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Admin panel headings: a geometric sans with a little more character than the body. */
const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

/**
 * Public site headlines and prices. A tall, condensed poster face, the same
 * voice as the cafe's printed deal flyers. Used big and sparingly.
 */
const poster = Big_Shoulders({
  variable: "--font-poster",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  // Next has no metrics to size a fallback for this face, so name a condensed
  // fallback outright instead of letting it guess.
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Roboto Condensed", "sans-serif"],
});

/** Public site body text: round and friendly, easy to read small on a phone. */
const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

/**
 * Used as the tab icon until a logo is uploaded. A generic cup rather than any
 * cafe specific mark, so nothing branded is hardcoded here.
 */
const FALLBACK_ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" rx="8" fill="#2f5d43"/>' +
      '<path d="M9 11h11v7a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" fill="none" ' +
      'stroke="#fdfaf3" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M20 13h2.5a2.5 2.5 0 0 1 0 5H20" fill="none" ' +
      'stroke="#fdfaf3" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M9 26h13" stroke="#fdfaf3" stroke-width="2" ' +
      'stroke-linecap="round"/>' +
    "</svg>"
  );

/**
 * Title, description and the social preview all come from settings, so the
 * owner controls how a shared link looks without touching code.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description =
    settings.tagline ||
    [settings.address, settings.hours].filter(Boolean).join(" \u00b7 ") ||
    undefined;

  return {
    title: {
      default: settings.cafe_name,
      template: `%s · ${settings.cafe_name}`,
    },
    description,
    icons: {
      icon: settings.logo_url ?? FALLBACK_ICON,
      apple: settings.logo_url ?? FALLBACK_ICON,
    },
    openGraph: {
      title: settings.cafe_name,
      description: description ?? undefined,
      type: "website",
      images: settings.logo_url ? [{ url: settings.logo_url }] : undefined,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${poster.variable} ${body.variable} h-full antialiased`}
    >
      {/* Browser extensions (ColorZilla, Grammarly and the like) add their own
          attributes to <body> before React loads. This only silences the
          resulting attribute mismatch on this one tag, not on the page. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
