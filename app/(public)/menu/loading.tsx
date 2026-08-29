import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder grid while the menu query resolves. */
export default function MenuLoading() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <Skeleton className="mx-auto h-8 w-40" />

      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-24" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
