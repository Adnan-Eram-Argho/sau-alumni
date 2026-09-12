"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Sob page-er upore boshe thake — ke login kora ache dekhay
export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Prothome ekhon-er obostha nei
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });

    // Tarpor login/logout hole khub somoyei jene nite
    // subscription — page theke gele cleanup (unsubscribe)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // onAuthStateChange header ke nije-i update kore debe
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-green-800">
          SAU Alumni
        </Link>

        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-gray-100" />
        ) : email ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium hover:bg-gray-50"
            >
              লগআউট
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/auth/login"
              className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium hover:bg-gray-50"
            >
              লগইন
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-green-700 px-3 py-1.5 font-medium text-white hover:bg-green-800"
            >
              সাইন আপ
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}