import { PageEntrance } from "@/components/motion/PageEntrance";
import { DealsSection } from "@/components/public/DealsSection";
import { FeaturedCarousel } from "@/components/public/FeaturedCarousel";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { LocationSection } from "@/components/public/LocationSection";
import {
  getActiveDeals,
  getActiveSlides,
  getFeaturedItems,
  getSettings,
} from "@/lib/queries";

export default async function Home() {
  const [settings, slides, deals, featured] = await Promise.all([
    getSettings(),
    getActiveSlides(),
    getActiveDeals(),
    getFeaturedItems(),
  ]);

  return (
    <>
      {/* No entrance animation: the hero is the first thing on screen and
          should simply be there, not slide into place. */}
      <HeroCarousel slides={slides} settings={settings} />
      {/* Deals first: they are the strongest reason to order today. */}
      <PageEntrance delay={0.08}>
        <DealsSection deals={deals} currency={settings.currency} />
      </PageEntrance>
      <PageEntrance delay={0.12}>
        <FeaturedCarousel items={featured} currency={settings.currency} />
      </PageEntrance>
      <LocationSection settings={settings} />
    </>
  );
}
