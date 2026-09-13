"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import NoticeBell from "@/components/NoticeBell";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  Megaphone,
  LayoutDashboard,
  LogOut,
  LogIn,
} from "lucide-react";

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
    <header className="sticky top-0 z-40 glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sau text-white shadow-md transition-shadow group-hover:glow-green">
            <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
              {/* Seedling stem */}
              <path d="M16 28c0-6 0-10 0-14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              {/* Left leaf */}
              <path d="M16 20c-3-1-6-3-7-7 4 0 6 2 7 5" fill="currentColor" opacity="0.85" />
              {/* Right leaf */}
              <path d="M16 16c3-1 6-4 7-8-4 0-6 3-7 6" fill="currentColor" opacity="0.85" />
              {/* Graduation cap top */}
              <polygon points="16,4 6,9 16,14 26,9" fill="currentColor" />
              {/* Graduation cap base */}
              <rect x="14" y="9" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
              {/* Tassel */}
              <path d="M6,9 L6,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="6" cy="14" r="1" fill="currentColor" />
              {/* Ground arc */}
              <path d="M10 28q6-2 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
          <span className="text-sau dark:text-emerald-300">SAU Alumni</span>
        </Link>

        {/* Right: [desktop nav+auth] [bell] [theme] [mobile ☰] */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <Link
              href="/directory"
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-sau/5 hover:text-sau dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
            >
              ডিরেক্টরি
            </Link>

            {email && (
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-sau/5 hover:text-sau dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
              >
                ড্যাশবোর্ড
              </Link>
            )}

            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-line/50" />
            ) : email ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden max-w-40 truncate text-ink/50 md:block">
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-medium transition-all hover:border-red-300 hover:bg-red-50/60 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  লগআউট
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-medium transition-all hover:border-sau/30 hover:bg-sau/5 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  লগইন
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-shimmer rounded-lg bg-sau px-3 py-1.5 font-medium text-white transition-colors hover:bg-sau-hover"
                >
                  সাইন আপ
                </Link>
              </div>
            )}
          </div>

          {/* Ek-i bell — sob screen-e visible */}
          <NoticeBell />
          <ThemeToggle />

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="মেনু"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink/70 transition-colors hover:bg-sau/5 hover:text-sau sm:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line sm:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-sm">
              <Link
                href="/directory"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-sau/5 hover:text-sau"
              >
                <Search className="h-4 w-4 text-sau/60" />
                ডিরেক্টরি
              </Link>
              <Link
                href="/notices"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-sau/5 hover:text-sau"
              >
                <Megaphone className="h-4 w-4 text-sau/60" />
                নোটিশ
              </Link>
              {email && (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-sau/5 hover:text-sau"
                >
                  <LayoutDashboard className="h-4 w-4 text-sau/60" />
                  ড্যাশবোর্ড
                </Link>
              )}

              <div className="mt-1 border-t border-line pt-2">
                {loading ? null : email ? (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-medium transition-colors hover:bg-red-50/60 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    লগআউট
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 font-medium transition-colors hover:bg-sau/5"
                    >
                      <LogIn className="h-4 w-4" />
                      লগইন
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMenuOpen(false)}
                      className="btn-shimmer rounded-lg bg-sau px-3 py-2.5 text-center font-medium text-white hover:bg-sau-hover"
                    >
                      সাইন আপ
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}