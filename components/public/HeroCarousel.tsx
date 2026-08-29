"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { clean } from "@/lib/format";
import type { CarouselSlide, SiteSettings } from "@/lib/types";

const AUTOPLAY_DELAY = 5000;

/** Shared frame so the carousel and the fallback occupy identical space. */
const FRAME = "relative aspect-4/5 w-full overflow-hidden sm:aspect-16/9";

function scrollToMenu(smooth: boolean) {
  document.getElementById("menu")?.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start",
  });
}

export function HeroCarousel({
  slides,
  settings,
}: {
  slides: CarouselSlide[];
  settings: SiteSettings;
}) {
  const reduceMotion = useReducedMotion();

  if (slides.length === 0) {
    return <HeroFallback settings={settings} reduceMotion={!!reduceMotion} />;
  }

  return <SlideCarousel slides={slides} reduceMotion={!!reduceMotion} />;
}

/** Plain hero used when the owner has not added any active slides yet. */
function HeroFallback({
  settings,
  reduceMotion,
}: {
  settings: SiteSettings;
  reduceMotion: boolean;
}) {
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
        <Button
          size="lg"
          className="mt-6"
          onClick={() => scrollToMenu(!reduceMotion)}
        >
          View menu
          <ChevronDown className="size-4" />
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
      stopOnInteraction: true,
      stopOnMouseEnter: true,
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
        className={FRAME}
      >
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full basis-full pl-0">
              <SlideImage slide={slide} priority={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {multiple ? (
          <>
            <CarouselPrevious className="left-4 hidden sm:flex" />
            <CarouselNext className="right-4 hidden sm:flex" />
          </>
        ) : null}
      </Carousel>

      {/* Caption and call to action sit above the images, outside the
          carousel's own overflow so they never clip. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end px-6 pb-10 text-center sm:pb-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id ?? "caption"}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-xl text-white drop-shadow"
          >
            {title ? (
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-sm text-pretty sm:text-lg">{subtitle}</p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <Button
          size="lg"
          className="pointer-events-auto mt-5"
          onClick={() => scrollToMenu(!reduceMotion)}
        >
          View menu
          <ChevronDown className="size-4" />
        </Button>

        {multiple ? (
          <div className="pointer-events-auto mt-5 flex gap-2">
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
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative size-full">
      {loaded ? null : <Skeleton className="absolute inset-0 rounded-none" />}
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
        onLoad={() => setLoaded(true)}
      />
      {/* Soft dark gradient keeps the caption readable on any photo. */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
    </div>
  );
}
