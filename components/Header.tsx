"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

// Sob page-er upore — nav + login obostha + theme toggle
export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sau text-sm font-black text-white">
            SAU
          </span>
          <span className="text-sau dark:text-emerald-300">SAU Alumni</span>
        </Link>

        {/* Desktop: nav + auth + theme */}
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/directory"
            className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-base"
          >
            ডিরেক্টরি
          </Link>
          <Link
            href="/notices"
            className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-base"
          >
            নোটিশ
          </Link>
          {email && (
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-base"
            >
              ড্যাশবোর্ড
            </Link>
          )}

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

        {/* Mobile: theme + menu button */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="মেনু"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-lg"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="border-t border-line sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-sm">
            <Link
              href="/directory"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 font-medium hover:bg-base"
            >
              🔍 ডিরেক্টরি
            </Link>
            <Link
              href="/notices"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 font-medium hover:bg-base"
            >
              📢 নোটিশ
            </Link>
            {email && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 font-medium hover:bg-base"
              >
                🏠 ড্যাশবোর্ড
              </Link>
            )}

            <div className="mt-1 border-t border-line pt-2">
              {loading ? null : email ? (
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-line px-3 py-2 text-left font-medium hover:bg-base"
                >
                  লগআউট
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-line px-3 py-2 font-medium hover:bg-base"
                  >
                    লগইন
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-sau px-3 py-2 text-center font-medium text-white hover:bg-sau-hover"
                  >
                    সাইন আপ
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}