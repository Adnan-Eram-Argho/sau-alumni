import { createClient } from "@supabase/supabase-js";

// Cookie-bihin anon client — SHUDHU public data-r jonno.
// Cookie touch kore na bole Next.js ISR/revalidate kaj kore.
// cookies() call korle Next.js page ke forced-dynamic banay
// ar revalidate silently ignore hoy — ei client seta theke bachay.
//
// KOKHONO member/admin/dashboard data-r jonno use korbe na.
// Shudhu homepage (hero images) + sitemap + health endpoint.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
