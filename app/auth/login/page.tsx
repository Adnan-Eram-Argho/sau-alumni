"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "সঠিক ইমেইল ঠিকানা দিন" }),
  password: z
    .string()
    .min(10, { message: "পাসওয়ার্ড অন্তত ১০ অক্ষরের হতে হবে" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });

      if (loginError) {
        setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
        return;
      }

      // "next" address chhilo? (jemon /dashboard theke eshechi) —
      // login sesh e sekhane-i pathiye dey. Safe-check soho:
      // nijer site-er vitorer path chara kothao na
      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get("next") ?? "/";
      const safeNext =
        nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : "/";
      router.push(safeNext);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10";

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-line shadow-xl">
        {/* Left panel — decorative gradient */}
        <div className="hidden w-2/5 gradient-hero p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-lg font-black backdrop-blur-sm">
              SAU
            </div>
            <h2 className="mt-6 text-2xl font-bold leading-snug">
              আবার স্বাগতম!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
              তোমার ব্যাচমেটরা অপেক্ষা করছে — লগইন করে আবার যুক্ত হও SAU
              পরিবারে।
            </p>
          </div>
          <p className="text-xs text-emerald-100/50">
            গবেষণা · শিক্ষা · সম্প্রসারণ
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-surface p-8 sm:p-10">
          <h1 className="text-2xl font-bold">লগইন করুন</h1>
          <p className="mt-1 text-sm text-ink/50">আবার স্বাগতম!</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                ইমেইল
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                পাসওয়ার্ড
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড"
                className={inputClass}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl bg-sau py-3 font-semibold text-white transition-all hover:bg-sau-hover disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "অপেক্ষা করুন..." : "লগইন"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/50">
            অ্যাকাউন্ট নেই?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-sau transition-colors hover:underline dark:text-emerald-300"
            >
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}