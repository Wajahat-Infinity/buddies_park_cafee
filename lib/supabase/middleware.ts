import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { hasSupabaseEnv } from "./env";

/**
 * Refreshes the Supabase session on every admin request and redirects
 * unauthenticated visitors to the login page. Public routes never reach here.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Without credentials there is no way to verify anyone, so the admin area
  // stays closed rather than failing open.
  if (!hasSupabaseEnv()) {
    return redirectToLogin(request);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // getUser revalidates the token with Supabase, unlike getSession.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const onLoginPage = pathname === "/admin/login";

  if (!user && !onLoginPage) return redirectToLogin(request);

  if (user && onLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next({ request });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}
