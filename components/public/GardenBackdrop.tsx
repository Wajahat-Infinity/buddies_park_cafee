/**
 * The light the cafe sits in. A fixed, purely decorative layer behind every
 * public page: warm sun from the top left, a cooler green on the right, and a
 * little grain so the flat colour reads as paper rather than pixels.
 *
 * Deliberately still. It used to carry falling leaves and swaying foliage, but
 * ambient movement competed with the food photography and read as a template
 * effect; motion now lives only where the visitor acts (adding to the cart,
 * switching category).
 *
 * A server component with no state — CSS only, so it costs nothing at runtime
 * and never blocks hydration. `-z-10` puts it behind page content, which is
 * unpositioned and therefore paints above it.
 */
export function GardenBackdrop() {
  return (
    <div
      aria-hidden
      className="garden-scene pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Sunlight pooling in from the top left, cooling into foliage on the
          right and settling into warm clay at the foot of the page. */}
      <div
        className="absolute -top-40 -left-32 size-[38rem] rounded-full opacity-75 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--sun) 62%, transparent), transparent 68%)",
        }}
      />
      <div
        className="absolute -top-24 -right-40 size-[32rem] rounded-full opacity-75 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--leaf) 42%, transparent), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-48 left-1/4 size-[42rem] rounded-full opacity-75 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--clay) 30%, transparent), transparent 72%)",
        }}
      />

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
