"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";

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
        // Kon jaygay bhul seta bole na — shudhu "mile ni"
        setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
        return;
      }

      // Home-e pathiye dei
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold">লগইন করুন</h1>
        <p className="mt-1 text-sm text-gray-500">আবার স্বাগতম!</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "অপেক্ষা করুন..." : "লগইন"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          অ্যাকাউন্ট নেই?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-green-700 hover:underline"
          >
            নতুন অ্যাকাউন্ট খুলুন
          </Link>
        </p>
      </div>
    </main>
  );
}