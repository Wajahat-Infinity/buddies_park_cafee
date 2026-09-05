/**
 * The garden the cafe sits in. A fixed, purely decorative layer behind every
 * public page: sun through a canopy, foliage in the corners, leaves drifting
 * down, and a little grain so the flat colour reads as paper rather than pixels.
 *
 * Deliberately a server component with no state — it is CSS and SVG only, so it
 * costs nothing at runtime and never blocks hydration. `-z-10` puts it behind
 * page content, which is unpositioned and therefore paints above it.
 */

/**
 * Fixed leaf choreography. Hardcoded rather than random so the server and the
 * client render identical markup; random values would produce a hydration
 * mismatch and re-scramble on every navigation.
 */
const LEAVES = [
  { left: "6%", delay: "0s", duration: "17s", size: 22, drift: "70px", tint: "leaf", opacity: 0.4 },
  { left: "19%", delay: "6s", duration: "23s", size: 15, drift: "-50px", tint: "clay", opacity: 0.3 },
  { left: "33%", delay: "11s", duration: "19s", size: 26, drift: "90px", tint: "leaf", opacity: 0.34 },
  { left: "47%", delay: "3s", duration: "26s", size: 18, drift: "-70px", tint: "sun", opacity: 0.42 },
  { left: "61%", delay: "14s", duration: "21s", size: 24, drift: "60px", tint: "leaf", opacity: 0.32 },
  { left: "74%", delay: "8s", duration: "25s", size: 16, drift: "-90px", tint: "clay", opacity: 0.28 },
  { left: "86%", delay: "17s", duration: "18s", size: 21, drift: "45px", tint: "leaf", opacity: 0.38 },
  { left: "93%", delay: "2s", duration: "28s", size: 14, drift: "-40px", tint: "sun", opacity: 0.3 },
] as const;

export function GardenBackdrop() {
  return (
    <div
      aria-hidden
      className="garden-scene pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Sunlight pooling in from the top left, cooling into foliage on the
          right. Two blurred orbs breathing out of sync read as light moving
          behind leaves. */}
      <div
        data-garden-motion
        className="absolute -top-40 -left-32 size-[38rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--sun) 62%, transparent), transparent 68%)",
          animation: "bloom 14s ease-in-out infinite",
        }}
      />
      <div
        data-garden-motion
        className="absolute -top-24 -right-40 size-[32rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--leaf) 42%, transparent), transparent 70%)",
          animation: "bloom 19s ease-in-out infinite 3s",
        }}
      />
      <div
        data-garden-motion
        className="absolute -bottom-48 left-1/4 size-[42rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--clay) 30%, transparent), transparent 72%)",
          animation: "bloom 22s ease-in-out infinite 7s",
        }}
      />

      <Canopy />

      {/* Leaves on the breeze. */}
      {LEAVES.map((leaf, index) => (
        <span
          key={index}
          data-garden-motion
          className="absolute top-0 block"
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size,
            color: `var(--${leaf.tint})`,
            ["--leaf-drift" as string]: leaf.drift,
            ["--leaf-opacity" as string]: leaf.opacity,
            animation: `leaf-fall ${leaf.duration} linear ${leaf.delay} infinite`,
            willChange: "transform, opacity",
          }}
        >
          <LeafGlyph />
        </span>
      ))}

      {/* Paper grain. Kept very low so it warms the surface without ever
          reading as noise on top of text. */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette: edges settle into shade, which pushes the eye to the middle
          of the page and makes the whole thing feel like a lit room. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, transparent 42%, color-mix(in oklch, var(--leaf-deep) 12%, transparent) 100%)",
        }}
      />
    </div>
  );
}

/** Overhanging foliage in the top corners, swaying gently out of sync. */
function Canopy() {
  return (
    <>
      <svg
        data-garden-motion
        viewBox="0 0 220 180"
        className="absolute -top-8 -left-10 w-52 origin-top-left text-leaf opacity-[0.16] blur-[1px] sm:w-72"
        style={{ animation: "sway 11s ease-in-out infinite" }}
        fill="currentColor"
      >
        <path d="M0 0c46 4 82 26 104 58 8 12-4 22-17 17C58 62 28 40 0 34Z" />
        <path d="M6 44c44 0 80 16 106 46 9 11-1 23-14 19C68 99 38 84 4 80Z" opacity="0.8" />
        <path d="M0 92c38-4 72 6 98 30 10 9 3 23-10 21C60 139 32 128 0 128Z" opacity="0.6" />
        <path d="M52 0c10 30 8 58-6 84-6 11-20 8-22-5-4-28 3-56 20-79Z" opacity="0.7" />
      </svg>

      <svg
        data-garden-motion
        viewBox="0 0 220 180"
        className="absolute -top-6 -right-10 w-48 origin-top-right -scale-x-100 text-leaf-deep opacity-[0.14] blur-[1px] sm:w-64"
        style={{ animation: "sway 14s ease-in-out infinite 2s" }}
        fill="currentColor"
      >
        <path d="M0 0c46 4 82 26 104 58 8 12-4 22-17 17C58 62 28 40 0 34Z" />
        <path d="M6 44c44 0 80 16 106 46 9 11-1 23-14 19C68 99 38 84 4 80Z" opacity="0.8" />
        <path d="M40 0c14 28 16 56 4 84-5 12-19 10-22-3-6-27-1-56 18-81Z" opacity="0.7" />
      </svg>
    </>
  );
}

/** A single leaf: one blade with a midrib. */
function LeafGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill="none">
      <path
        d="M21 3C11 3 3 8.5 3 16c0 2 .6 3.8 1.7 5.3C7 17 11.5 13.8 17 12.4c-4.6 2.3-8 5.9-9.6 10.1 1.3.4 2.7.5 4.1.3C19 21.6 21 12.8 21 3Z"
        fill="currentColor"
      />
      <path
        d="M21 3C15 8 10 15 7.4 22.5"
        stroke="color-mix(in oklch, var(--background) 65%, transparent)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
