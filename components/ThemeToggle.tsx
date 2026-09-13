"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

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
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink/60 transition-all hover:bg-sau/5 hover:text-sau dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
    >
      {dark === null ? null : (
        <motion.div
          key={dark ? "dark" : "light"}
          initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {dark ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </motion.div>
      )}
    </button>
  );
}