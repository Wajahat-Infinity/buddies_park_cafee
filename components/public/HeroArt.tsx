"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  image: string;
  alt: string;
  /** Deal name and price for the lime sticker; omitted for a plain photo. */
  sticker?: { name: string; price: string };
};

/** Long enough to read a deal name and price before the next one arrives. */
const INTERVAL_MS = 5000;

/**
 * The hero photo. With several deals it cycles through them: each photo
 * cross fades into the next and its price sticker pops on. Deliberately a
 * plain fade, no zoom or tilt, since a moving hero read as shaky before.
 *
 * Rotation pauses while the pointer or keyboard focus is on it and while the
 * tab is hidden, and never starts for anyone who asks for less motion; the
 * dots let anyone step through by hand.
 */
export function HeroArt({
  slides,
  extras,
}: {
  slides: HeroSlide[];
  /** Up to two small round photos around the main one. */
  extras: string[];
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const multiple = slides.length > 1;

  useEffect(() => {
    if (!multiple || paused || reduceMotion) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((current) => (current + 1) % slides.length);
      }
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [multiple, paused, reduceMotion, slides.length]);

  const current = slides[index] ?? slides[0];
  if (!current) return null;

  return (
    <div
      className="relative mx-auto w-full max-w-md md:max-w-none"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-4/3 -rotate-2 overflow-hidden rounded-3xl shadow-[0_30px_50px_-24px_rgb(0_0_0/0.7)]">
        {/* Every photo stays mounted, so each one has loaded long before its
            turn and the fade never shows a half drawn image. */}
        {slides.map((slide, position) => (
          <Image
            key={slide.id}
            src={slide.image}
            alt={position === index ? slide.alt : ""}
            aria-hidden={position !== index}
            fill
            loading={position === 0 ? "eager" : "lazy"}
            fetchPriority={position === 0 ? "high" : undefined}
            sizes="(min-width: 768px) 45vw, 92vw"
            className={cn(
              "object-cover transition-opacity duration-700 ease-out",
              position === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {current.sticker ? (
          <motion.div
            key={current.id}
            className="brush bg-lime text-park absolute -right-1 -bottom-6 px-4 pt-2 pb-3 sm:-right-3"
            initial={
              reduceMotion
                ? { opacity: 0, rotate: 4 }
                : { opacity: 0, scale: 0.7, rotate: -5 }
            }
            animate={{ opacity: 1, scale: 1, rotate: 4 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.85, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 16 }}
          >
            <p className="font-poster text-sm leading-none font-extrabold tracking-wider uppercase">
              {current.sticker.name}
            </p>
            <p className="font-poster text-5xl leading-none font-black tabular-nums">
              {current.sticker.price}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {extras.map((url, position) => (
        <span
          key={url}
          aria-hidden
          className={
            position === 0
              ? "absolute -top-6 -right-2 size-24 overflow-hidden rounded-full sm:size-32"
              : "absolute -bottom-8 -left-3 hidden size-24 overflow-hidden rounded-full sm:block sm:size-28"
          }
          style={{ boxShadow: "0 0 0 5px var(--park), 0 0 0 8px var(--lime)" }}
        >
          <Image src={url} alt="" fill sizes="128px" className="object-cover" />
        </span>
      ))}

      {multiple ? (
        <div className="mt-11 flex justify-center gap-2">
          {slides.map((slide, position) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Show ${slide.alt}`}
              aria-current={position === index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                position === index
                  ? "bg-lime w-7"
                  : "w-2 bg-white/35 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
