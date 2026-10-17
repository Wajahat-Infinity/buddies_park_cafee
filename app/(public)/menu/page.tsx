import { MenuSection } from "@/components/public/MenuSection";
import { SectionHeading } from "@/components/public/SectionHeading";
import { getCategoriesWithItems, getSettings } from "@/lib/queries";

export const metadata = { title: "Menu" };

/** `?category=<slug>` opens the menu on that category (the home page tiles). */
export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [settings, categories, params] = await Promise.all([
    getSettings(),
    getCategoriesWithItems(),
    searchParams,
  ]);
  const requested =
    typeof params.category === "string" ? params.category : undefined;

  if (categories.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading as="h1" eyebrow="Served all day">
          Our menu
        </SectionHeading>
        <p className="text-park/65 mt-4 text-sm">
          The menu is being updated. Please check back shortly.
        </p>
      </section>
    );
  }

  return (
    <MenuSection
      categories={categories}
      currency={settings.currency}
      initialSlug={requested}
    />
  );
}
