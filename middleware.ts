import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/** Only the admin area is guarded; the public site stays untouched. */
export const config = {
  matcher: ["/admin/:path*"],
};
