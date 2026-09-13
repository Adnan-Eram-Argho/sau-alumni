"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

const emailSchema = z
    .string()
    .trim()
    .email({ message: "সঠিক ইমেইল ঠিকানা দিন" });

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        const result = emailSchema.safeParse(email);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                result.data,
                {
                    // Email-er link → callback → reset-password page
                    redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
                }
            );

            if (resetError) {
                console.error("Reset request failed:", resetError.message);
                setError("অনুরোধ পাঠানো গেলো না। একটু পরে আবার চেষ্টা করুন।");
                return;
            }

            setSent(true);
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "mt-1 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10";

    return (
        <main className="flex min-h-[70vh] items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-xl sm:p-10">
                <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 text-xs text-ink/50 transition-colors hover:text-ink"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    লগইনে ফিরুন
                </Link>

                <h1 className="mt-4 text-2xl font-bold">পাসওয়ার্ড ভুলে গেছো?</h1>
                <p className="mt-1 text-sm text-ink/50">
                    ইমেইল দাও — রিসেট লিংক পাঠিয়ে দেব।
                </p>

                {sent ? (
                    <div className="mt-8 rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        ✉️ <strong>ইমেইল দেখুন!</strong> রিসেট লিংক পাঠানো হয়েছে{" "}
                        {email}-এ। লিংকে click করে নতুন পাসওয়ার্ড সেট করো।
                        <p className="mt-1.5 text-xs opacity-70">
                            (না পেলে স্প্যাম ফোল্ডারও দেখুন)
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">
                                তোমার ইমেইল
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
                                <Mail className="h-4 w-4" />
                            )}
                            {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}