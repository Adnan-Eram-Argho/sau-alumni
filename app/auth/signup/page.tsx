"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";

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
            "পাসওয়ার্ডটি দুর্বল বা চুরি-হওয়া তালিকায় ধরা পড়েছে। একদম নতুন, এলোমেলা একটা পাসওয়ার্ড দিন।"
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold">নতুন অ্যাকাউন্ট খুলুন</h1>
        <p className="mt-1 text-sm text-gray-500">SAU Alumni নেটওয়ার্কে যোগ দিন</p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              পুরো নাম <span className="text-gray-400">(ইংরেজিতে লিখুন)</span>
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Adnan Eram Argho"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="অন্তত ১০ অক্ষর"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-600 focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-gray-400">অন্তত ১০ অক্ষর দিন</p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "অপেক্ষা করুন..." : "অ্যাকাউন্ট খুলুন"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-green-700 hover:underline"
          >
            লগইন করুন
          </Link>
        </p>
      </div>
    </main>
  );
}