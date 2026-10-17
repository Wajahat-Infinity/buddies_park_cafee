import Image from "next/image";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

import { HeadingLink, SectionHeading } from "@/components/public/SectionHeading";
import { categoryThumbnail } from "@/lib/menu";
import type { CategoryWithItems } from "@/lib/types";

/**
 * "What are you craving?": every category as a round photo tile. A tap opens
 * the menu already showing that category.
 */
export function CategoryTiles({
  categories,
}: {
  categories: CategoryWithItems[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="Browse the menu"
        action={
          <Link href="/menu" className="group">
            <HeadingLink>Full menu →</HeadingLink>
          </Link>
        }
      >
        What are you craving?
      </SectionHeading>

      <div className="mt-9 grid grid-cols-3 gap-x-3 gap-y-7 lg:grid-cols-9">
        {categories.map((category) => {
          const thumbnail = categoryThumbnail(category);
          return (
            <Link
              key={category.id}
              href={`/menu?category=${encodeURIComponent(category.slug)}`}
              className="group text-park text-center"
            >
              <span
                className="bg-paper relative mx-auto grid aspect-square w-full max-w-28 place-items-center overflow-hidden rounded-full"
                style={{ boxShadow: "0 0 0 3px #fff, 0 0 0 5px var(--lime)" }}
              >
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : (
                  <UtensilsCrossed className="text-park/40 size-7" />
                )}
              </span>
              <span className="mt-3 block text-sm leading-tight font-bold text-balance">
                {category.name}
              </span>
              <span className="text-park/55 mt-0.5 block text-xs tabular-nums">
                {category.items.length}{" "}
                {category.items.length === 1 ? "item" : "items"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
