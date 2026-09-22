import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authPagesLimiter, apiMutationLimiter } from "@/utils/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  // ---- CSRF Origin Check for API mutations ----
  if (isApiRoute && isMutation && pathname !== "/api/health") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { error: "forbidden", message: "Invalid request origin" },
            { status: 403, headers: { "Cache-Control": "no-store" } }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "bad_request", message: "Malformed origin header" },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }
    }
  }

  // ---- Rate limit: API mutation routes ----
  if (isApiRoute && isMutation && pathname !== "/api/health" && apiMutationLimiter) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await apiMutationLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        {
          error: "too_many_requests",
          message: "অনেকবার অনুরোধ পাঠানো হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        },
        { status: 429, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  // ---- Rate limit: login/signup page ----
  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/forgot-password");

  if (isAuthPage && authPagesLimiter) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await authPagesLimiter.limit(ip);
    if (!success) {
      return new NextResponse(
        "অনেকবার চেষ্টা করা হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।",
        { status: 429 }
      );
    }
  }

  // ---- Session refresh ----
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: createServerClient-er sathe sathe-i hoy
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---- Member area talabondho ----
  // Login chara /dashboard-e dhukle login page-e pathiye dey —
  // ar "next" param-e bole dey login sesh e kothay fire jete
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|swe-worker|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};