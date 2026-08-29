import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";
import { getSettings } from "@/lib/queries";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const settings = await getSettings();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">{settings.cafe_name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to manage the site
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
