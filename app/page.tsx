import { AnnouncementBar } from "@/components/public/AnnouncementBar";
import { CartBar } from "@/components/public/CartBar";
import { FeaturedCarousel } from "@/components/public/FeaturedCarousel";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { LocationSection } from "@/components/public/LocationSection";
import { MenuSection } from "@/components/public/MenuSection";
import { CartProvider } from "@/context/CartContext";
import {
  getActiveSlides,
  getCategoriesWithItems,
  getFeaturedItems,
  getSettings,
} from "@/lib/queries";

/** Settings are fetched once here and passed down to every section. */
export default async function Home() {
  const [settings, slides, categories, featured] = await Promise.all([
    getSettings(),
    getActiveSlides(),
    getCategoriesWithItems(),
    getFeaturedItems(),
  ]);

  return (
    <CartProvider>
      <div id="top" className="flex min-h-dvh flex-col">
        <AnnouncementBar settings={settings} />
        <Header settings={settings} />

        <main className="flex-1">
          <HeroCarousel slides={slides} settings={settings} />
          <FeaturedCarousel items={featured} currency={settings.currency} />
          <MenuSection categories={categories} currency={settings.currency} />

          {categories.length === 0 ? (
            <section
              id="menu"
              className="mx-auto max-w-5xl scroll-mt-16 px-4 py-20 text-center"
            >
              <p className="text-muted-foreground text-sm">
                The menu is being updated. Please check back shortly.
              </p>
            </section>
          ) : null}

          <LocationSection settings={settings} />

          <CartBar settings={settings} />
        </main>

        <Footer settings={settings} />
      </div>
    </CartProvider>
  );
}
