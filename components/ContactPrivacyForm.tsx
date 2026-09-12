"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";

const contactSchema = z.object({
  phone_number: z
    .string()
    .trim()
    .max(30, { message: "ফোন নম্বর খুব বড়" })
    .refine((v) => !v || /^\+?[0-9\- ]{6,20}$/.test(v), {
      message: "ফোন নম্বরটা দেখে নাও (শুধু সংখ্যা, +, -)",
    }),
  phone_visibility: z.enum(["private", "members_only", "public"]),
  is_public: z.boolean(),
});

export default function ContactPrivacyForm({
  userId,
  email,
  initial,
  isPublic,
}: {
  userId: string;
  email: string;
  initial: { phone_number: string; phone_visibility: string };
  isPublic: boolean;
}) {
  const [phone, setPhone] = useState(initial.phone_number);
  const [visibility, setVisibility] = useState(
    initial.phone_visibility === "members_only" ||
      initial.phone_visibility === "public"
      ? initial.phone_visibility
      : "private"
  );
  const [profilePublic, setProfilePublic] = useState(isPublic);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = contactSchema.safeParse({
      phone_number: phone.trim() || "",
      phone_visibility: visibility,
      is_public: profilePublic,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Contact-ghor (email NOT NULL — ei email-ei boshe dey)
      const { error: contactError } = await supabase
        .from("profile_contacts")
        .upsert({
          profile_id: userId,
          email: email,
          phone_number: result.data.phone_number || null,
          phone_visibility: result.data.phone_visibility,
          updated_at: new Date().toISOString(),
        });

      if (contactError) {
        console.error("Contact save failed:", contactError.message);
        setError("সেভ করতে সমস্যা হলো। একটু পরে আবার চেষ্টা করো।");
        return;
      }

      // Profile public/private
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_public: result.data.is_public })
        .eq("id", userId);

      if (profileError) {
        console.error("Profile visibility save failed:", profileError.message);
        setError("সেভ করতে সমস্যা হলো। একটু পরে আবার চেষ্টা করো।");
        return;
      }

      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-8 space-y-6">
      {/* Email */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-medium text-ink/60">ইমেইল</h2>
        <p className="mt-2 break-all text-sm">{email}</p>
        <p className="mt-1 text-xs text-ink/50">
          ডিজাইন অনুযায়ী ইমেইল সবার কাছে দেখাবে — alumni network-এর যোগাযোগের মূল
          দরজা এটাই।
        </p>
      </div>

      {/* Phone */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-medium text-ink/60">ফোন নম্বর</h2>
        <input
          id="phone"
          type="text"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setSuccess(false);
          }}
          placeholder="e.g. +880 1XXX-XXXXXX"
          className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-sau focus:outline-none"
        />

        <p className="mt-4 text-sm font-medium">ফোন নম্বর দেখাবে কাকে?</p>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="phone_visibility"
              checked={visibility === "private"}
              onChange={() => {
                setVisibility("private");
                setSuccess(false);
              }}
              className="accent-sau"
            />
            🔒 কারো না (শুধু আমি নিজে)
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="phone_visibility"
              checked={visibility === "members_only"}
              onChange={() => {
                setVisibility("members_only");
                setSuccess(false);
              }}
              className="accent-sau"
            />
            👥 শুধু লগইন-করা সদস্যরা
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="phone_visibility"
              checked={visibility === "public"}
              onChange={() => {
                setVisibility("public");
                setSuccess(false);
              }}
              className="accent-sau"
            />
            🌍 সবাই
          </label>
        </div>
      </div>

      {/* Profile visibility */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-medium text-ink/60">প্রোফাইল</h2>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="is_public"
              checked={profilePublic}
              onChange={() => {
                setProfilePublic(true);
                setSuccess(false);
              }}
              className="accent-sau"
            />
            🌍 Public — directory-তে সবাই আমাকে খুঁজে পাবে
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="is_public"
              checked={!profilePublic}
              onChange={() => {
                setProfilePublic(false);
                setSuccess(false);
              }}
              className="accent-sau"
            />
            🔒 Private — শুধু আমি নিজে দেখব
          </label>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          ✓ সেভ হয়ে গেছে!
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-sau px-6 py-2.5 font-semibold text-white hover:bg-sau-hover disabled:opacity-50"
        >
          {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink/60 hover:text-ink"
        >
          ড্যাশবোর্ডে ফিরুন
        </Link>
      </div>
    </form>
  );
}