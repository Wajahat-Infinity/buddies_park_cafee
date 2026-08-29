import { FeaturedCarousel } from "@/components/public/FeaturedCarousel";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { LocationSection } from "@/components/public/LocationSection";
import { getActiveSlides, getFeaturedItems, getSettings } from "@/lib/queries";

export default async function Home() {
  const [settings, slides, featured] = await Promise.all([
    getSettings(),
    getActiveSlides(),
    getFeaturedItems(),
  ]);

  return (
    <>
      <HeroCarousel slides={slides} settings={settings} />
      <FeaturedCarousel items={featured} currency={settings.currency} />
      <LocationSection settings={settings} />
    </>
  );
}
