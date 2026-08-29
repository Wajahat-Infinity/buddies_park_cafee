"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { clean } from "@/lib/format";
import type { CarouselSlide, SiteSettings } from "@/lib/types";

const AUTOPLAY_DELAY = 5000;

/**
 * Shared frame so the carousel and the fallback occupy identical space.
 *
 * `[&>div]:h-full` is required: CarouselContent renders its own wrapper div
 * that no prop can reach, and without a height there it collapses to zero and
 * the fill images become invisible.
 */
const FRAME = "relative aspect-4/5 w-full overflow-hidden sm:aspect-16/9";
const CAROUSEL_FRAME = `${FRAME} [&>div]:h-full`;

export function HeroCarousel({
  slides,
  settings,
}: {
  slides: CarouselSlide[];
  settings: SiteSettings;
}) {
  const reduceMotion = useReducedMotion();

  if (slides.length === 0) {
    return <HeroFallback settings={settings} />;
  }

  return <SlideCarousel slides={slides} reduceMotion={!!reduceMotion} />;
}

/** Plain hero used when the owner has not added any active slides yet. */
function HeroFallback({ settings }: { settings: SiteSettings }) {
  const tagline = clean(settings.tagline);

  return (
    <section className={cn(FRAME, "bg-muted flex items-center justify-center")}>
      <div className="mx-auto max-w-xl px-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          {settings.cafe_name}
        </h1>
        {tagline ? (
          <p className="text-muted-foreground mt-3 text-base text-pretty sm:text-lg">
            {tagline}
          </p>
        ) : null}
        <Button asChild size="lg" className="mt-6 h-12 px-10 text-base">
          <Link href="/menu">View menu</Link>
        </Button>
      </div>
    </section>
  );
}

function SlideCarousel({
  slides,
  reduceMotion,
}: {
  slides: CarouselSlide[];
  reduceMotion: boolean;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  // A single slide should not loop, autoplay or show dots.
  const multiple = slides.length > 1;
  // Lazy state rather than a ref: the plugin instance must stay stable across
  // renders and is read during render when it is handed to the carousel.
  const [autoplay] = useState(() =>
    Autoplay({
      delay: AUTOPLAY_DELAY,
      // Keep rotating: pausing on hover left the hero frozen on desktop,
      // where the pointer sits over it most of the time.
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      playOnInit: true,
    })
  );

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const goTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const active = slides[selected];
  const title = clean(active?.title);
  const subtitle = clean(active?.subtitle);

  return (
    <section className="relative">
      <Carousel
        setApi={setApi}
        opts={{ loop: multiple, align: "start" }}
        plugins={multiple && !reduceMotion ? [autoplay] : []}
        className={CAROUSEL_FRAME}
      >
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full basis-full pl-0">
              <SlideImage slide={slide} priority={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>

      </Carousel>

      {/* Caption and call to action sit above the images, outside the
          carousel's own overflow so they never clip. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id ?? "caption"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-xl text-white"
            // A text shadow hugs the glyphs. The drop-shadow filter utility
            // paints an offset copy of each letter, which reads as doubled
            // text on a bright photo.
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.55)" }}
          >
            {title ? (
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-sm text-pretty opacity-90 sm:text-lg">
                {subtitle}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <Button
          asChild
          size="lg"
          className="pointer-events-auto mt-6 h-12 px-10 text-base"
        >
          <Link href="/menu">View menu</Link>
        </Button>

        {multiple ? (
          <div className="pointer-events-auto absolute bottom-6 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selected}
                onClick={() => goTo(index)}
                className={cn(
                  "h-2 rounded-full bg-white/50 transition-all duration-300",
                  index === selected ? "w-6 bg-white" : "w-2 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** One image, with a skeleton underneath until it has decoded. */
function SlideImage({
  slide,
  priority,
}: {
  slide: CarouselSlide;
  priority: boolean;
}) {
  // `settled` covers both outcomes: a failed image must stop the skeleton too,
  // otherwise a blocked or missing file leaves a grey box forever.
  const [settled, setSettled] = useState(false);
  const [failed, setFailed] = useState(false);
  const loaded = settled && !failed;

  return (
    <div className="relative size-full overflow-hidden bg-neutral-900">
      {settled ? null : <Skeleton className="absolute inset-0 rounded-none" />}

      <Image
        src={slide.image_url}
        alt={clean(slide.title) ?? ""}
        fill
        priority={priority}
        sizes="100vw"
        className={cn(
          "object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setSettled(true)}
        onError={() => {
          setFailed(true);
          setSettled(true);
        }}
      />

      {/* Even scrim keeps the centred caption readable on any photo. */}
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
}
