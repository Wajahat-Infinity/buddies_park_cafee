import { MenuSection } from "@/components/public/MenuSection";
import { getCategoriesWithItems, getSettings } from "@/lib/queries";

export const metadata = { title: "Menu" };

export default async function MenuPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategoriesWithItems(),
  ]);

  if (categories.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Our menu</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The menu is being updated. Please check back shortly.
        </p>
      </section>
    );
  }

  return <MenuSection categories={categories} currency={settings.currency} />;
}
