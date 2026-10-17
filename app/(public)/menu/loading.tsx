import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder in the menu's own shape while the menu query resolves. */
export default function MenuLoading() {
  return (
    <>
      <div className="bg-park">
        <div className="mx-auto max-w-6xl space-y-3 px-4 pt-10 pb-8">
          <Skeleton className="h-3 w-24 bg-white/15" />
          <Skeleton className="h-14 w-56 bg-white/15" />
          <Skeleton className="h-3 w-40 bg-white/15" />
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        <Skeleton className="bg-park/10 h-13 w-full rounded-full lg:hidden" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex gap-3 rounded-2xl bg-white p-2 sm:block sm:p-0">
              <Skeleton className="bg-park/10 size-22 shrink-0 rounded-xl sm:aspect-4/3 sm:size-auto sm:w-full sm:rounded-none" />
              <div className="flex-1 space-y-2 py-1 sm:p-4">
                <Skeleton className="bg-park/10 h-4 w-3/4" />
                <Skeleton className="bg-park/10 h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
