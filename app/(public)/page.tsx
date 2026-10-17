import { CategoryTiles } from "@/components/public/CategoryTiles";
import { DealsSection } from "@/components/public/DealsSection";
import { DealsTicker } from "@/components/public/DealsTicker";
import { HomeHero } from "@/components/public/HomeHero";
import { HowToOrder } from "@/components/public/HowToOrder";
import { LocationSection } from "@/components/public/LocationSection";
import { PopularItems } from "@/components/public/PopularItems";
import {
  getActiveDeals,
  getActiveSlides,
  getCategoriesWithItems,
  getFeaturedItems,
  getSettings,
} from "@/lib/queries";

export default async function Home() {
  const [settings, slides, deals, featured, categories] = await Promise.all([
    getSettings(),
    getActiveSlides(),
    getActiveDeals(),
    getFeaturedItems(),
    getCategoriesWithItems(),
  ]);

  return (
    <>
      <HomeHero
        settings={settings}
        deals={deals}
        carousel={slides}
        featured={featured}
      />
      <DealsTicker deals={deals} currency={settings.currency} />
      <CategoryTiles categories={categories} />
      <DealsSection deals={deals} currency={settings.currency} />
      <HowToOrder settings={settings} />
      <PopularItems items={featured} currency={settings.currency} />
      <LocationSection settings={settings} />
    </>
  );
}
