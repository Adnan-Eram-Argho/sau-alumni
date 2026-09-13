"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "নাম অন্তত ২ অক্ষরের হতে হবে" })
    .max(100, { message: "নাম খুব বড় হয়ে গেছে" }),
  email: z.string().trim().email({ message: "সঠিক ইমেইল ঠিকানা দিন" }),
  password: z
    .string()
    .min(10, { message: "পাসওয়ার্ড অন্তত ১০ অক্ষরের হতে হবে" })
    .max(72, { message: "পাসওয়ার্ড ৭২ অক্ষরের মধ্যে রাখুন" }),
});

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = signupSchema.safeParse({ fullName, email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Email confirm OFF — sathe sathe account + auto login
      const { data, error: signupError } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: { full_name: result.data.fullName },
        },
      });

      if (signupError) {
        const msg = signupError.message.toLowerCase();
        if (msg.includes("already")) {
          setError("এই ইমেইল দিয়ে অ্যাকাউন্ট ইতিমধ্যে আছে। লগইন করুন।");
        } else if (msg.includes("password")) {
          setError(
            "পাসওয়ার্ডটি দুর্বল বা চুরি-হওয়া তালিকায় ধরা পড়েছে। একদম নতুন, এলোমেলো একটা পাসওয়ার্ড দিন।"
          );
        } else {
          setError("কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।");
        }
        return;
      }

      if (data.user) {
        // Profile row
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: result.data.fullName,
          });

        if (insertError) {
          console.error("Profile insert failed:", insertError.message);
        }

        // Contact-ghor: email boshai deya (phone user pore
        // nijer iccha moto add korbe, default private)
        const { error: contactError } = await supabase
          .from("profile_contacts")
          .insert({
            profile_id: data.user.id,
            email: result.data.email,
          });

        if (contactError) {
          console.error("Contact insert failed:", contactError.message);
        }
      }

      router.push("/");
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
              SAU পরিবারে
              <br />
              যোগ দাও!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
              ২ মিনিটে অ্যাকাউন্ট খুলে তোমার ব্যাচমেটদের সাথে আবার যুক্ত হও। সম্পূর্ণ বিনামূল্যে।
            </p>
          </div>
          <p className="text-xs text-emerald-100/50">
            গবেষণা · শিক্ষা · সম্প্রসারণ
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-surface p-8 sm:p-10">
          <h1 className="text-2xl font-bold">নতুন অ্যাকাউন্ট খুলুন</h1>
          <p className="mt-1 text-sm text-ink/50">SAU Alumni নেটওয়ার্কে যোগ দিন</p>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium">
                পুরো নাম <span className="text-ink/35">(ইংরেজিতে লিখুন)</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adnan Eram Argho"
                className={inputClass}
                required
              />
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="অন্তত ১০ অক্ষর"
                className={inputClass}
                required
              />
              <p className="mt-1.5 text-xs text-ink/40">অন্তত ১০ অক্ষর দিন</p>
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
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? "অপেক্ষা করুন..." : "অ্যাকাউন্ট খুলুন"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/50">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-sau transition-colors hover:underline dark:text-emerald-300"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}