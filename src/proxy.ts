import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

// Next.js 16 renamed Middleware to Proxy; behavior is unchanged.
// This performs an optimistic auth check for /kifaruadmin/**: is there a
// signed-in Supabase user at all? The deeper "is this user actually staff"
// check (against the `profiles` table) happens in the admin layout's DAL,
// close to the data — see src/lib/admin/dal.ts.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/kifaruadmin/login";

  if (!isSupabaseConfigured) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/kifaruadmin/login", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (!data.user && !isLoginPage) {
    return NextResponse.redirect(new URL("/kifaruadmin/login", request.url));
  }

  if (data.user && isLoginPage) {
    return NextResponse.redirect(new URL("/kifaruadmin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/kifaruadmin/:path*"],
};
