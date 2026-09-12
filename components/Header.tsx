"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
      setLoading(false);
    });

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
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sau text-sm font-black text-white">
            SAU
          </span>
          <span className="text-sau dark:text-emerald-300">SAU Alumni</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/directory"
            className="hidden rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-base sm:block"
          >
            ডিরেক্টরি
          </Link>

          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-base" />
          ) : email ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden max-w-40 truncate text-ink/70 md:block">
                {email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-line px-3 py-1.5 font-medium hover:bg-base"
              >
                লগআউট
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/auth/login"
                className="rounded-lg border border-line px-3 py-1.5 font-medium hover:bg-base"
              >
                লগইন
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-sau px-3 py-1.5 font-medium text-white hover:bg-sau-hover"
              >
                সাইন আপ
              </Link>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}