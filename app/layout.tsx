import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
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

/** Headings only: a geometric sans with a little more character than the body. */
const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

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
    icons: settings.logo_url ? { icon: settings.logo_url } : undefined,
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
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
