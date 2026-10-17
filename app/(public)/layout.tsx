import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import { BottomNav } from "@/components/public/BottomNav";
import { CartBar } from "@/components/public/CartBar";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { TopStrip } from "@/components/public/TopStrip";
import { FlyToCartProvider } from "@/components/motion/FlyToCart";
import { CartProvider } from "@/context/CartContext";
import { getSettings } from "@/lib/queries";

/**
 * Chrome shared by every public page. The cart provider lives here rather than
 * on a page, so an order survives moving between the home page and the menu.
 *
 * The public site carries its own brand fonts and colours on this wrapper, so
 * the admin panel, which shares the root layout, keeps its neutral look.
 */
export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSettings();

  return (
    <CartProvider>
      <FlyToCartProvider>
        {/* Bottom padding on phones keeps the footer clear of the tab bar. */}
        <div
          id="top"
          className="bg-paper text-park font-body flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          <AnnouncementBar settings={settings} />
          <TopStrip settings={settings} />
          <Header settings={settings} />

          <main className="flex-1">
            {children}
            <CartBar settings={settings} />
          </main>

          <Footer settings={settings} />
        </div>

        <BottomNav />

        {/* Page views for the public site only, so the owner's own visits to
            the admin panel never inflate the numbers. */}
        <Analytics />
      </FlyToCartProvider>
    </CartProvider>
  );
}
