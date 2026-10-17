import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import { CartBar } from "@/components/public/CartBar";
import { Footer } from "@/components/public/Footer";
import { GardenBackdrop } from "@/components/public/GardenBackdrop";
import { Header } from "@/components/public/Header";
import { CartProvider } from "@/context/CartContext";
import { getSettings } from "@/lib/queries";

/**
 * Chrome shared by every public page. The cart provider lives here rather than
 * on a page, so an order survives moving between the home page and the menu.
 */
export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSettings();

  return (
    <CartProvider>
      <GardenBackdrop />

      <div id="top" className="relative flex min-h-dvh flex-col">
        <AnnouncementBar settings={settings} />
        <Header settings={settings} />

        <main className="flex-1">
          {children}
          <CartBar settings={settings} />
        </main>

        <Footer settings={settings} />
      </div>

      {/* Page views for the public site only, so the owner's own visits to
          the admin panel never inflate the numbers. */}
      <Analytics />
    </CartProvider>
  );
}
