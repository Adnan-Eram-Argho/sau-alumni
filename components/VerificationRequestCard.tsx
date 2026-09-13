"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { BadgeCheck, Clock, Loader2, AlertCircle, Send } from "lucide-react";

export default function VerificationRequestCard({
  userId,
  isVerified,
  hasPendingRequest,
}: {
  userId: string;
  isVerified: boolean;
  hasPendingRequest: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(hasPendingRequest);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isVerified) return null;

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from("verification_requests")
        .insert({
          profile_id: userId,
          evidence_note: note.trim() || null,
        });

      if (insertError) {
        console.error("Verification request failed:", insertError.message);
        setError("অনুরোধ পাঠানো গেলো না। একটু পরে আবার চেষ্টা করো।");
        return;
      }

      setPending(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (pending) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 glass-card rounded-2xl p-5"
      >
        <p className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-amber-500" />
          Verify-অনুরোধ পাঠানো হয়েছে
        </p>
        <p className="mt-1 text-sm text-ink/50">
          Admin-রা দেখে তোমার প্রোফাইলে{" "}
          <BadgeCheck className="inline h-3.5 w-3.5 text-sau dark:text-emerald-400" />{" "}
          বসিয়ে দেবে।
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mt-6 glass-card rounded-2xl p-5">
      <p className="flex items-center gap-2 text-sm font-medium">
        <BadgeCheck className="h-4 w-4 text-sau dark:text-emerald-400" />
        আমাকে verified বানাও
      </p>
      <p className="mt-1 text-sm text-ink/50">
        পরিচয় যাচাই হলে মানুষ তোমার প্রোফাইল বেশি বিশ্বাস করবে। সাথে এক লাইনে
        সাক্ষ্য দাও (batch, ভর্তির সাল, পরিচিত কেউ)।
      </p>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Batch 2019, Dept of Agricultural Economics"
        className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10"
      />
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
      <button
        onClick={submit}
        disabled={loading}
        className="btn-shimmer mt-3 flex items-center gap-2 rounded-xl bg-sau px-5 py-2.5 text-sm font-semibold text-white hover:bg-sau-hover disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {loading ? "পাঠানো হচ্ছে..." : "অনুরোধ পাঠান"}
      </button>
    </div>
  );
}