// TEMPORARY: Part 1 verification of the data layer. Delete at the start of
// Part 2, when the real shell starts rendering this data.
import {
  getActiveSlides,
  getCategoriesWithItems,
  getFeaturedItems,
  getSettings,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const [settings, slides, categories, featured] = await Promise.all([
    getSettings(),
    getActiveSlides(),
    getCategoriesWithItems(),
    getFeaturedItems(),
  ]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 text-sm">
      <section>
        <h2 className="font-semibold">Settings</h2>
        <p>name: {settings.cafe_name}</p>
        <p>currency: {settings.currency}</p>
        <p>whatsapp: {settings.phone_whatsapp ?? "—"}</p>
        <p>address: {settings.address ?? "—"}</p>
      </section>

      <section>
        <h2 className="font-semibold">Active slides ({slides.length})</h2>
        <ul className="list-disc pl-5">
          {slides.map((slide) => (
            <li key={slide.id}>
              {slide.sort_order}. {slide.title ?? slide.image_url}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">Categories ({categories.length})</h2>
        {categories.map((category) => (
          <div key={category.id} className="mt-2">
            <p className="font-medium">
              {category.sort_order}. {category.name} ({category.items.length})
            </p>
            <ul className="list-disc pl-5">
              {category.items.map((item) => (
                <li key={item.id}>
                  {item.name} — {settings.currency} {item.price}
                  {item.is_available ? "" : " (sold out)"}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-semibold">Featured ({featured.length})</h2>
        <ul className="list-disc pl-5">
          {featured.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
