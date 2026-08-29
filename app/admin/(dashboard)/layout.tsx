import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

/**
 * Shell for every admin screen except login, which sits outside this route
 * group so it renders without the navigation.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh">
      <AdminNav email={user?.email ?? null} />
      <main className="min-w-0 flex-1 px-4 pt-18 pb-20 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
