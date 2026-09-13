"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { KeyRound, Loader2, AlertCircle } from "lucide-react";

const passwordSchema = z
    .string()
    .min(10, { message: "পাসওয়ার্ড অন্তত ১০ অক্ষরের হতে হবে" })
    .max(72, { message: "পাসওয়ার্ড ৭২ অক্ষরের মধ্যে রাখুন" });

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleReset(e: FormEvent) {
        e.preventDefault();
        setError(null);

        const result = passwordSchema.safeParse(password);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        if (password !== confirm) {
            setError("দুটো পাসওয়ার্ড মিলছে না।");
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({
                password: result.data,
            });

            if (updateError) {
                if (updateError.message.toLowerCase().includes("password")) {
                    setError(
                        "পাসওয়ার্ডটি দুর্বল বা চুরি-হওয়া তালিকায় ধরা পড়েছে। একদম নতুন, এলোমেলা একটা দিন।"
                    );
                } else {
                    setError("সেশন পাওয়া যায়নি — ইমেইলের লিংক থেকে আবার এসো।");
                }
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "mt-1 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10";

    return (
        <main className="flex min-h-[70vh] items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-xl sm:p-10">
                <h1 className="text-2xl font-bold">নতুন পাসওয়ার্ড সেট করো</h1>
                <p className="mt-1 text-sm text-ink/50">
                    ইমেইলের লিংক থেকে এসেছো — এখন নতুন পাসওয়ার্ড দাও।
                </p>

                <form onSubmit={handleReset} className="mt-8 space-y-5">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium">
                            নতুন পাসওয়ার্ড
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
                    </div>

                    <div>
                        <label htmlFor="confirm" className="block text-sm font-medium">
                            আবার লিখো (নিশ্চিত করতে)
                        </label>
                        <input
                            id="confirm"
                            type="password"
                            autoComplete="new-password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="একই পাসওয়ার্ড"
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
                            <KeyRound className="h-4 w-4" />
                        )}
                        {loading ? "সেভ হচ্ছে..." : "পাসওয়ার্ড বদলাও"}
                    </button>
                </form>
            </div>
        </main>
    );
}