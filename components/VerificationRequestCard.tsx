"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <p className="text-sm font-medium">⏳ Verify-অনুরোধ পাঠানো হয়েছে</p>
        <p className="mt-1 text-sm text-ink/60">
          Admin-রা দেখে তোমার প্রোফাইলে ✅ বসিয়ে দেবে।
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="text-sm font-medium">আমাকে ✅ verified বানাও</p>
      <p className="mt-1 text-sm text-ink/60">
        পরিচয় যাচাই হলে মানুষ তোমার প্রোফাইল বেশি বিশ্বাস করবে। সাথে এক লাইনে
        সাক্ষ্য দাও (batch, ভর্তির সাল, পরিচিত কেউ)।
      </p>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Batch 2019, Dept of Agricultural Economics"
        className="mt-3 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-sau focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={submit}
        disabled={loading}
        className="mt-3 rounded-xl bg-sau px-5 py-2.5 text-sm font-semibold text-white hover:bg-sau-hover disabled:opacity-50"
      >
        {loading ? "পাঠানো হচ্ছে..." : "অনুরোধ পাঠান"}
      </button>
    </div>
  );
}