"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  faculties: { id: string; name: string }[];
  countries: string[];
};

export default function DirectoryFilters({ faculties, countries }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [text, setText] = useState(searchParams.get("q") ?? "");
  const [loc, setLoc] = useState(searchParams.get("loc") ?? "all");
  const [country, setCountry] = useState(searchParams.get("country") ?? "");
  const [faculty, setFaculty] = useState(searchParams.get("faculty") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL-e param boshiye server ke abar data ane
  function applyParams(updates: Record<string, string | null>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    // Filter bodlale page shuru theke — cursor reset
    sp.delete("before");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  // 300ms debounce — protyek keystroke-e DB hit hoy na
  function handleTextChange(value: string) {
    setText(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      applyParams({ q: value.trim() || null });
    }, 300);
  }

  function handleReset() {
    setText("");
    setLoc("all");
    setCountry("");
    setFaculty("");
    router.replace(pathname);
  }

  const hasFilter = text || loc !== "all" || country || faculty;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="নাম, কোম্পানি বা পদবি লিখুন..."
        className="min-w-52 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm focus:border-sau focus:outline-none"
      />

      <select
        value={faculty}
        onChange={(e) => {
          setFaculty(e.target.value);
          applyParams({ faculty: e.target.value || null });
        }}
        className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-sau focus:outline-none"
      >
        <option value="">সব ফ্যাকাল্টি</option>
        {faculties.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <select
        value={loc}
        onChange={(e) => {
          const v = e.target.value;
          setLoc(v);
          setCountry("");
          applyParams({ loc: v === "all" ? null : v, country: null });
        }}
        className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-sau focus:outline-none"
      >
        <option value="all">সবাই</option>
        <option value="bd">বাংলাদেশে</option>
        <option value="abroad">বিদেশে</option>
      </select>

      {loc === "abroad" && (
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            applyParams({ country: e.target.value || null });
          }}
          className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm focus:border-sau focus:outline-none"
        >
          <option value="">সব দেশ</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      {hasFilter && (
        <button
          onClick={handleReset}
          className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:text-ink"
        >
          ✕ ফিল্টার মুছুন
        </button>
      )}
    </div>
  );
}