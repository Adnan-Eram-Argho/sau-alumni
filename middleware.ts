import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authPagesLimiter } from "@/utils/rate-limit";

// Prottek request-e: (1) auth page-e rate limit check,
// (2) Supabase login session fresh rakhe
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Rate limit: login/signup page ----
  const isAuthPage =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");

  if (isAuthPage && authPagesLimiter) {
    // IP ber kori (Vercel-e "x-forwarded-for" header-e thake)
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
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

  // IMPORTANT: ei call-ta createServerClient er sathe sathe-i
  // hoy — eta-i session refresh kore
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|swe-worker|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};