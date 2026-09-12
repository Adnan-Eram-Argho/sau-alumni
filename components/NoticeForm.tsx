"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import ImageUploader from "@/components/ImageUploader";

const noticeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "শিরোনাম অন্তত ৫ অক্ষরের হতে হবে" })
    .max(150, { message: "শিরোনাম খুব বড়" }),
  content: z
    .string()
    .trim()
    .min(10, { message: "বিষয়বস্তু অন্তত ১০ অক্ষরের" })
    .max(20000, { message: "বিষয়বস্তু সর্বোচ্চ ২০০০০ অক্ষর" }),
});

export type NoticeInitial = {
  title: string;
  content: string;
  image_url: string | null;
  faculty_id: string | null;
  department_id: string | null;
};

// Purono chobi Storage theke muchhe dey — server-route
// (service-role) diye: guaranteed, RLS-e atkabe na
async function deleteOldImage(url: string) {
  try {
    const res = await fetch("/api/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error(
        "Notice image cleanup failed:",
        data.error ?? res.status,
        "|",
        url
      );
    }
  } catch (e) {
    console.error("Notice image cleanup failed:", e);
  }
}

export default function NoticeForm({
  userId,
  faculties,
  departments,
  mode = "create",
  noticeId,
  initial,
}: {
  userId: string;
  faculties: { id: string; name: string }[];
  departments: {
    id: string;
    name: string;
    facultyId: string | null;
    facultyName: string | null;
  }[];
  mode?: "create" | "edit";
  noticeId?: string;
  initial?: NoticeInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    initial?.image_url ?? null
  );
  // Sesh bar SAVE-kora chhilo je chobi — cleanup er hishab
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(
    initial?.image_url ?? null
  );
  const [facultyId, setFacultyId] = useState(initial?.faculty_id ?? "");
  const [departmentId, setDepartmentId] = useState(
    initial?.department_id ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-sau focus:outline-none";

  const filteredDepts = facultyId
    ? departments.filter((d) => d.facultyId === facultyId)
    : departments;

  function slugify(text: string, suffix = "") {
    const s = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return s ? `${s}${suffix}` : `notice-${Date.now()}${suffix}`;
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = noticeSchema.safeParse({ title, content });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const payload = {
      title: result.data.title,
      content: result.data.content,
      image_url: imageUrl,
      faculty_id: facultyId || null,
      department_id: departmentId || null,
    };

    setLoading(true);
    try {
      if (mode === "edit" && noticeId) {
        const res = await fetch("/api/notices", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: noticeId, ...payload }),
        });

        if (!res.ok) {
          setError("সেভ করতে সমস্যা হলো। আবার চেষ্টা করো।");
          return;
        }
      } else {
        const supabase = createClient();
        const base = {
          author_id: userId,
          ...payload,
          status: "draft" as const,
        };

        const { error: insertError } = await supabase
          .from("notices")
          .insert({ ...base, slug: slugify(result.data.title) });

        if (insertError) {
          if (insertError.message.includes("duplicate key")) {
            const { error: retryError } = await supabase
              .from("notices")
              .insert({
                ...base,
                slug: slugify(
                  result.data.title,
                  `-${Math.random().toString(36).slice(2, 6)}`
                ),
              });
            if (retryError) {
              console.error("Notice insert failed:", retryError.message);
              setError("সেভ করতে সমস্যা হলো। আবার চেষ্টা করো।");
              return;
            }
          } else {
            console.error("Notice insert failed:", insertError.message);
            setError("সেভ করতে সমস্যা হলো। আবার চেষ্টা করো।");
            return;
          }
        }
      }

      // CLEANUP: ager SAVE-kora chobi ar use hocche na —
      // Storage theke muchhe de (server-route, guaranteed)
      if (savedImageUrl && savedImageUrl !== imageUrl) {
        await deleteOldImage(savedImageUrl);
      }
      setSavedImageUrl(imageUrl);

      router.push("/dashboard/notices");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-8 space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          শিরোনাম <span className="text-ink/40">(ইংরেজিতে)</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Alumni Meetup 2026 Announcement"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium">
          বিষয়বস্তু{" "}
          <span className="text-ink/40">(ইংরেজিতে, Markdown চলবে)</span>
        </label>
        <textarea
          id="content"
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            "Full notice text... Markdown tips: **bold**, # heading, [link](https://...)"
          }
          className={inputClass}
          required
        />
      </div>

      <div>
        <p className="text-sm font-medium">ছবি (ঐচ্ছিক)</p>
        {imageUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Notice image"
              className="max-h-48 rounded-xl border border-line"
            />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="mt-1 text-xs text-red-600 hover:underline"
            >
              ✕ ছবি সরাও (সেভ করলে Storage থেকেও মুছে যাবে)
            </button>
          </div>
        )}
        <div className="mt-2">
          <ImageUploader onUploaded={(img) => setImageUrl(img.publicUrl)} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="faculty" className="block text-sm font-medium">
            কার জন্য? <span className="text-ink/40">(খালি = সবার জন্য)</span>
          </label>
          <select
            id="faculty"
            value={facultyId}
            onChange={(e) => {
              setFacultyId(e.target.value);
              setDepartmentId("");
            }}
            className={inputClass}
          >
            <option value="">সবার জন্য</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium">
            নির্দিষ্ট বিভাগ (ঐচ্ছিক)
          </label>
          <select
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className={inputClass}
          >
            <option value="">— না —</option>
            {filteredDepts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.facultyName ? ` (${d.facultyName})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-sau px-6 py-2.5 font-semibold text-white hover:bg-sau-hover disabled:opacity-50"
        >
          {loading
            ? "সেভ হচ্ছে..."
            : mode === "edit"
              ? "পরিবর্তন সেভ করুন"
              : "খসড়া সেভ করুন"}
        </button>
        <span className="text-xs text-ink/50">
          {mode === "edit"
            ? "খসড়া আপডেট হবে"
            : "খসড়া সেভ হবে — admin প্রকাশ করলে সবাই দেখবে"}
        </span>
      </div>
    </form>
  );
}