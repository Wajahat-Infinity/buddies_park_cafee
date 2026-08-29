import { PageEntrance } from "@/components/motion/PageEntrance";
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
      <PageEntrance>
        <HeroCarousel slides={slides} settings={settings} />
      </PageEntrance>
      <PageEntrance delay={0.12}>
        <FeaturedCarousel items={featured} currency={settings.currency} />
      </PageEntrance>
      <LocationSection settings={settings} />
    </>
  );
}
