import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Email-er confirm link theke asha manush ei address-e porte
// pare. Ekhan-e amra: 1) login complete kori  2) profile row
// na thakle baniye dei
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Redirect validation — sudhu nijer site-er bhitorer path,
  // bahirer kono website na (open redirect attack thekai dey)
  const nextParam = searchParams.get("next") ?? "/";
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Login hoye geche. User-er profile row ache kina check kori:
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        // Row na thakle baniye dei — signup form-e dewa nam-ta
        // user-er metadata-tey save kora chhilo
        if (!existingProfile) {
          const fullName =
            user.user_metadata?.full_name ?? "New Member";
          await supabase
            .from("profiles")
            .insert({ id: user.id, full_name: fullName });
        }
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Code na thakle ba somossa hole — home-e ferot
  return NextResponse.redirect(`${origin}/`);
}