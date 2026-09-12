"use client";

import { useEffect, useState } from "react";

// Dark/light toggle — OS-r default, user-er iccha
// localStorage-e save thake
export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDark(stored === "dark" || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    if (dark !== null) {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [dark]);

  function handleToggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={handleToggle}
      aria-label="আলো/অন্ধকার মোড বদলান"
      title="আলো/অন্ধকার মোড"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-base hover:bg-base"
    >
      {dark === null ? "" : dark ? "☀️" : "🌙"}
    </button>
  );
}