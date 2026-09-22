"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { BATCH_YEARS } from "@/utils/batch";

type Props = {
  countries: string[];
};

export default function DirectoryFilters({ countries }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [text, setText] = useState(searchParams.get("q") ?? "");
  const [loc, setLoc] = useState(searchParams.get("loc") ?? "all");
  const [country, setCountry] = useState(searchParams.get("country") ?? "");
  const [batch, setBatch] = useState(searchParams.get("batch") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

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
    setBatch("");
    router.replace(pathname);
  }

  const hasFilter = text || loc !== "all" || country || batch;

  const selectClass =
    "rounded-xl border border-line bg-surface px-3 py-2.5 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10";

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="relative min-w-52 flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
        <input
          type="search"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="নাম, কোম্পানি বা পদবি লিখুন..."
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10"
        />
      </div>

      <select
        value={batch}
        onChange={(e) => {
          setBatch(e.target.value);
          applyParams({ batch: e.target.value || null });
        }}
        className={selectClass}
      >
        <option value="">সব ব্যাচ</option>
        {BATCH_YEARS.map((y) => (
          <option key={y} value={y}>
            ব্যাচ {y}
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
        className={selectClass}
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
          className={selectClass}
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
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/50 transition-colors hover:bg-red-50/60 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <X className="h-3.5 w-3.5" />
          ফিল্টার মুছুন
        </button>
      )}
    </div>
  );
}