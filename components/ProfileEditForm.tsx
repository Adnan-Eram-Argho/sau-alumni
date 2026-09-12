"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { COUNTRIES } from "@/utils/countries";

export type ProfileInitial = {
  id: string;
  full_name: string | null;
  department_id: string | null;
  graduation_year: number | null;
  status: string | null;
  current_designation: string | null;
  current_company: string | null;
  linkedin_url: string | null;
  current_country: string | null;
  higher_study_institution: string | null;
  higher_study_program: string | null;
  bio: string | null;
};

// Validation — bhul holei Bengali message
const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "নাম অন্তত ২ অক্ষরের হতে হবে" })
    .max(100, { message: "নাম খুব বড় হয়ে গেছে" }),
  department_id: z.string().nullable(),
  status: z.enum(["alumnus", "current_student"]),
  graduation_year: z
    .number()
    .int({ message: "বছরটা সংখ্যায় দাও" })
    .min(1900, { message: "বছরটা দেখে নাও" })
    .max(2105, { message: "বছরটা দেখে নাও" })
    .nullable(),
  current_country: z.string().min(1, { message: "দেশ বেছে নাও" }),
  current_designation: z.string().trim().max(100).nullable(),
  current_company: z.string().trim().max(100).nullable(),
  linkedin_url: z
    .string()
    .trim()
    .refine((v) => !v || /^https:\/\/(www\.)?linkedin\.com\/.+/i.test(v), {
      message: "LinkedIn-এর পূর্ণ লিংক দাও (https:// দিয়ে শুরু)",
    })
    .nullable(),
  higher_study_program: z.string().trim().max(200).nullable(),
  higher_study_institution: z.string().trim().max(200).nullable(),
  bio: z
    .string()
    .trim()
    .max(1000, { message: "Bio সর্বোচ্চ ১০০০ অক্ষরের" })
    .nullable(),
});

export default function ProfileEditForm({
  userId,
  initial,
  departments,
}: {
  userId: string;
  initial: ProfileInitial | null;
  departments: { id: string; name: string; facultyName: string | null }[];
}) {
  const inputClass =
    "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-sau focus:outline-none";

  const [form, setForm] = useState({
    full_name: initial?.full_name ?? "",
    department_id: initial?.department_id ?? "",
    status: initial?.status === "current_student" ? "current_student" : "alumnus",
    graduation_year: initial?.graduation_year?.toString() ?? "",
    current_country: initial?.current_country ?? "Bangladesh",
    current_designation: initial?.current_designation ?? "",
    current_company: initial?.current_company ?? "",
    linkedin_url: initial?.linkedin_url ?? "",
    higher_study_program: initial?.higher_study_program ?? "",
    higher_study_institution: initial?.higher_study_institution ?? "",
    bio: initial?.bio ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = profileSchema.safeParse({
      full_name: form.full_name,
      department_id: form.department_id || null,
      status: form.status,
      graduation_year: form.graduation_year
        ? Number(form.graduation_year)
        : null,
      current_country: form.current_country,
      current_designation: form.current_designation || null,
      current_company: form.current_company || null,
      linkedin_url: form.linkedin_url || null,
      higher_study_program: form.higher_study_program || null,
      higher_study_institution: form.higher_study_institution || null,
      bio: form.bio || null,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Row thakle UPDATE, na thakle INSERT — dui-i
      // khetre RLS malik-ke allow kore. Role/is_verified
      // ei form-e nei — oi dorja admin-only
      const { error: saveError } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...result.data });
      if (saveError) {
        console.error("Profile save failed:", saveError.message);
        setError("সেভ করতে সমস্যা হলো। একটু পরে আবার চেষ্টা করো।");
        return;
      }
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-8 space-y-5">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium">
          পুরো নাম <span className="text-ink/40">(ইংরেজিতে লিখবে)</span>
        </label>
        <input
          id="full_name"
          type="text"
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="e.g. Adnan Eram Argho"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="department_id" className="block text-sm font-medium">
          বিভাগ
        </label>
        <select
          id="department_id"
          value={form.department_id}
          onChange={(e) => set("department_id", e.target.value)}
          className={inputClass}
        >
          <option value="">— বিভাগ বেছে নাও —</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
              {d.facultyName ? ` (${d.facultyName})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-sm font-medium">আমি একজন</span>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="status"
              checked={form.status === "alumnus"}
              onChange={() => set("status", "alumnus")}
              className="accent-sau"
            />
            প্রাক্তন শিক্ষার্থী (Alumnus)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="status"
              checked={form.status === "current_student"}
              onChange={() => set("status", "current_student")}
              className="accent-sau"
            />
            বর্তমান শিক্ষার্থী
          </label>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="graduation_year"
            className="block text-sm font-medium"
          >
            ব্যাচের বছর
            <span className="block text-xs font-normal text-ink/40">
              (শিক্ষার্থী হলে সম্ভাব্য শেষের বছর)
            </span>
          </label>
          <input
            id="graduation_year"
            type="number"
            value={form.graduation_year}
            onChange={(e) => set("graduation_year", e.target.value)}
            placeholder="e.g. 2020"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="current_country"
            className="block text-sm font-medium"
          >
            বর্তমানে কোথায় আছো?
          </label>
          <select
            id="current_country"
            value={form.current_country}
            onChange={(e) => set("current_country", e.target.value)}
            className={inputClass}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="current_designation"
            className="block text-sm font-medium"
          >
            পদবি (Designation)
          </label>
          <input
            id="current_designation"
            type="text"
            value={form.current_designation}
            onChange={(e) => set("current_designation", e.target.value)}
            placeholder="e.g. Agricultural Officer"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="current_company"
            className="block text-sm font-medium"
          >
            প্রতিষ্ঠান / কোম্পানি
          </label>
          <input
            id="current_company"
            type="text"
            value={form.current_company}
            onChange={(e) => set("current_company", e.target.value)}
            placeholder="e.g. BRAC"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="linkedin_url" className="block text-sm font-medium">
          LinkedIn প্রোফাইলের লিংক
        </label>
        <input
          id="linkedin_url"
          type="url"
          value={form.linkedin_url}
          onChange={(e) => set("linkedin_url", e.target.value)}
          placeholder="https://www.linkedin.com/in/..."
          className={inputClass}
        />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm font-medium">
          উচ্চশিক্ষা{" "}
          <span className="font-normal text-ink/40">
            (বিদেশে/দেশে পড়াশোনা করলে পূরণ করো)
          </span>
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="higher_study_program"
              className="block text-sm font-medium"
            >
              প্রোগ্রাম
            </label>
            <input
              id="higher_study_program"
              type="text"
              value={form.higher_study_program}
              onChange={(e) => set("higher_study_program", e.target.value)}
              placeholder="e.g. MSc Agricultural Economics"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="higher_study_institution"
              className="block text-sm font-medium"
            >
              প্রতিষ্ঠান
            </label>
            <input
              id="higher_study_institution"
              type="text"
              value={form.higher_study_institution}
              onChange={(e) => set("higher_study_institution", e.target.value)}
              placeholder="e.g. University of Reading"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          নিজের সম্পর্কে <span className="text-ink/40">(ইংরেজিতে)</span>
        </label>
        <textarea
          id="bio"
          rows={4}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Short introduction — kaj, interest, achievement..."
          className={inputClass}
        />
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