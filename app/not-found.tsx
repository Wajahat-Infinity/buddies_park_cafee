import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/queries";

export default async function NotFound() {
  const settings = await getSettings();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        This page does not exist
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm text-pretty">
        The page you were looking for has moved or never existed. Everything
        else at {settings.cafe_name} is still where you left it.
      </p>
      <div className="mt-2 flex gap-2">
        <Button asChild>
          <Link href="/menu">See the menu</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
