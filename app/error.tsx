"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Shown when a page throws, including when Supabase is unreachable. The public
 * queries already degrade to empty data, so this is the last line of defence.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page error]", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="text-muted-foreground max-w-sm text-sm text-pretty">
        We could not load this page just now. Please try again in a moment.
      </p>
      <Button onClick={reset} className="mt-2">
        Try again
      </Button>
    </main>
  );
}
