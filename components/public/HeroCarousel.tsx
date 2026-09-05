"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

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

/**
 * The header is 4rem tall and sits transparently over the hero, so the hero
 * starts that much higher and its top strip shows through it. This belongs on
 * the outer section: putting it on the carousel alone would leave the caption
 * overlay, which spans the section, offset from the image.
 */
const HERO_OFFSET = "-mt-16";

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

/**
 * Plain hero used when the owner has not added any active slides yet. Rather
 * than an empty grey box it stands in as a little scene of its own: a lit
 * garden wall with a cup steaming on it.
 */
function HeroFallback({ settings }: { settings: SiteSettings }) {
  const tagline = clean(settings.tagline);

  return (
    <section
      className={cn(
        FRAME,
        HERO_OFFSET,
        "arch-bottom flex items-center justify-center pt-16"
      )}
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, color-mix(in oklch, var(--sun) 55%, transparent), transparent 60%), linear-gradient(to bottom, color-mix(in oklch, var(--leaf) 22%, var(--background)), var(--background))",
      }}
    >
      <div className="scene mx-auto max-w-xl px-6 text-center">
        <SteamingCup />

        <motion.h1
          initial={{ opacity: 0, y: 24, rotateX: -18 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-hero mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          {settings.cafe_name}
        </motion.h1>

        {tagline ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
            className="text-muted-foreground font-hero mt-3 text-base italic text-pretty sm:text-lg"
          >
            {tagline}
          </motion.p>
        ) : null}

        <Button
          asChild
          size="lg"
          className="press-3d mt-7 h-12 rounded-full px-10 text-base"
        >
          <Link href="/menu">View menu</Link>
        </Button>
      </div>
    </section>
  );
}

/** A cup with three ribbons of steam rising out of sync. */
function SteamingCup() {
  return (
    <div className="relative mx-auto w-fit" aria-hidden>
      <div className="absolute inset-x-0 -top-6 flex justify-center gap-2">
        {[0, 0.7, 1.4].map((delay) => (
          <span
            key={delay}
            data-garden-motion
            className="bg-foreground/35 block h-6 w-1 rounded-full blur-[2px]"
            style={{ animation: `steam 3.2s ease-out ${delay}s infinite` }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 64 48"
        className="text-leaf-deep float-slow size-16 drop-shadow-lg"
        data-garden-motion
        fill="none"
        strokeWidth="3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M8 14h34v16a12 12 0 0 1-12 12h-10a12 12 0 0 1-12-12z"
          fill="color-mix(in oklch, var(--card) 90%, var(--sun))"
        />
        <path d="M42 18h6a7 7 0 0 1 0 14h-6" />
        <path d="M6 46h42" />
      </svg>
    </div>
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
    <section className={cn("relative", HERO_OFFSET)}>
      <Carousel
        setApi={setApi}
        opts={{ loop: multiple, align: "start" }}
        plugins={multiple && !reduceMotion ? [autoplay] : []}
        className={cn(CAROUSEL_FRAME, "arch-bottom")}
      >
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full basis-full pl-0">
              <SlideImage
                slide={slide}
                priority={index === 0}
                active={index === selected}
                drift={!reduceMotion}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Caption and call to action sit above the images, outside the
          carousel's own overflow so they never clip. */}
      <div className="scene pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id ?? "caption"}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, rotateX: -22, filter: "blur(6px)" }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-hero-ink max-w-xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            {title ? (
              <h1
                className="font-hero text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
                // A text shadow hugs the glyphs. The drop-shadow filter utility
                // paints an offset copy of each letter, which reads as doubled
                // text on a bright photo.
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
              >
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p
                className="font-hero text-hero-ink-soft mt-3 text-sm italic text-pretty sm:text-lg"
                style={{ textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}
              >
                {subtitle}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          className="pointer-events-auto mt-7"
        >
          <Button
            asChild
            size="lg"
            className="press-3d sheen h-12 overflow-hidden rounded-full px-10 text-base"
          >
            <Link href="/menu">View menu</Link>
          </Button>
        </motion.div>

        {/* A cue that there is more below the fold — it bobs rather than
            blinks, which is easier to ignore once you have seen it. */}
        <ChevronDown
          aria-hidden
          data-garden-motion
          className="mt-8 size-6 text-white/80 drop-shadow"
          style={{ animation: "nudge-down 2.4s ease-in-out infinite" }}
        />

        {multiple ? (
          <div className="pointer-events-auto absolute bottom-6 flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selected}
                className={cn(
                  "h-2 rounded-full transition-all duration-500 ease-out",
                  index === selected
                    ? "w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    : "w-2 bg-white/50 hover:w-4 hover:bg-white/80"
                )}
                onClick={() => goTo(index)}
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
  active,
  drift,
}: {
  slide: CarouselSlide;
  priority: boolean;
  active: boolean;
  drift: boolean;
}) {
  // `settled` covers both outcomes: a failed image must stop the skeleton too,
  // otherwise a blocked or missing file leaves a grey box forever.
  const [settled, setSettled] = useState(false);
  const [failed, setFailed] = useState(false);
  const loaded = settled && !failed;

  return (
    <div className="relative size-full overflow-hidden bg-neutral-900">
      {settled ? null : <Skeleton className="absolute inset-0 rounded-none" />}

      {/* The slow push keyed to `active` restarts each time the slide comes
          around, so a still photograph never sits perfectly dead. */}
      <div
        key={active ? "drifting" : "still"}
        className={cn("size-full", drift && active && loaded && "ken-burns")}
      >
        <Image
          src={slide.image_url}
          alt={clean(slide.title) ?? ""}
          fill
          priority={priority}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setSettled(true)}
          onError={() => {
            setFailed(true);
            setSettled(true);
          }}
        />
      </div>

      {/* Layered scrim rather than a flat wash: darkest at the very top so the
          transparent header stays legible, warm and deep at the foot so the
          hero hands off to the cream page below, lighter through the middle so
          the photograph is still the photograph. */}
      <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/25 to-black/60" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 60% at 50% 45%, transparent 35%, color-mix(in oklch, var(--leaf-deep) 42%, transparent) 100%)",
        }}
      />
    </div>
  );
}
