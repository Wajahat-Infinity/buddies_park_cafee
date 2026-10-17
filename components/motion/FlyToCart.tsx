"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Edge of the flying thumbnail, in pixels. */
const THUMB = 80;

/** Long enough to read as a throw, short enough not to hold up the next tap. */
const FLIGHT_SECONDS = 0.7;

type Flight = {
  id: number;
  image: string | null;
  /** Centre of the photo the flight leaves from. */
  fromX: number;
  fromY: number;
  /** How far it travels to reach the cart bar. */
  dx: number;
  dy: number;
};

type FlyValue = {
  /** Sends a copy of `source` (an item photo) arcing down into the cart bar. */
  fly: (source: HTMLElement | null) => void;
  /** Counts landings, so the cart bar can react the moment a flight arrives. */
  landings: number;
};

const FlyContext = createContext<FlyValue | null>(null);

/** Centre of an element, if it is on screen at all. */
function centreOf(id: string) {
  const element = document.getElementById(id);
  if (!element || element.offsetParent === null) return null;
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Where the order lives on screen. On the first add the order bar is not
 * mounted yet (it appears with the very item being thrown), so fall back to
 * the Order tab on phones, then to the bar's spot at the bottom centre.
 */
function cartTarget() {
  return (
    centreOf("cart-bar") ??
    centreOf("cart-tab") ?? { x: window.innerWidth / 2, y: window.innerHeight - 40 }
  );
}

/**
 * Overlay for the add to cart animation. Lives beside the cart provider rather
 * than inside it: the cart is state, this is purely decoration, and anyone who
 * asks for less motion gets no flights at all.
 */
export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [landings, setLandings] = useState(0);
  const nextId = useRef(0);

  const fly = useCallback(
    (source: HTMLElement | null) => {
      if (reduceMotion || !source) return;

      const rect = source.getBoundingClientRect();
      const fromX = rect.left + rect.width / 2;
      const fromY = rect.top + rect.height / 2;
      const target = cartTarget();
      // The photo the visitor is looking at is already decoded, so reusing its
      // exact source costs no extra download.
      const image = source.querySelector("img")?.currentSrc || null;

      nextId.current += 1;
      setFlights((current) => [
        ...current,
        {
          id: nextId.current,
          image,
          fromX,
          fromY,
          dx: target.x - fromX,
          dy: target.y - fromY,
        },
      ]);
    },
    [reduceMotion]
  );

  const land = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
    setLandings((count) => count + 1);
  }, []);

  const value = useMemo(() => ({ fly, landings }), [fly, landings]);

  return (
    <FlyContext.Provider value={value}>
      {children}

      <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
        {flights.map((flight) => (
          <motion.div
            key={flight.id}
            className="bg-lime absolute rounded-2xl bg-cover bg-center shadow-lg ring-2 ring-white"
            style={{
              left: flight.fromX - THUMB / 2,
              top: flight.fromY - THUMB / 2,
              width: THUMB,
              height: THUMB,
              backgroundImage: flight.image ? `url("${flight.image}")` : undefined,
            }}
            initial={{ x: 0, y: 0, scale: 0.6, opacity: 0 }}
            animate={{
              x: flight.dx,
              y: flight.dy,
              scale: [0.6, 1.1, 0.25],
              opacity: [0, 1, 0.9],
              rotate: -12,
            }}
            transition={{
              duration: FLIGHT_SECONDS,
              x: { duration: FLIGHT_SECONDS, ease: [0.3, 0, 0.7, 1] },
              // A negative first control point lifts it slightly before it
              // drops, which is what turns a straight slide into a throw.
              y: { duration: FLIGHT_SECONDS, ease: [0.5, -0.6, 0.9, 0.6] },
              scale: { duration: FLIGHT_SECONDS, times: [0, 0.25, 1] },
              opacity: { duration: FLIGHT_SECONDS, times: [0, 0.15, 1] },
            }}
            onAnimationComplete={() => land(flight.id)}
          />
        ))}
      </div>
    </FlyContext.Provider>
  );
}

export function useFlyToCart() {
  const context = useContext(FlyContext);
  if (!context) {
    throw new Error("useFlyToCart must be used inside a FlyToCartProvider");
  }
  return context;
}
