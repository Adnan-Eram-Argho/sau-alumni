"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-e cholar jonno Supabase client
// (browser-e chole emon button/form theke call hobe)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}