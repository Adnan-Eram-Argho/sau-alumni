"use client";

import Link from "next/link";

// Floating badge — niche dan pashe ghuri thake,
// hover korle boye "Made by..." dekhay (spec Section 9)
export default function MadeByBadge() {
  return (
    <Link
      href="/about"
      aria-label="Made by Adnan Eram Argho"
      className="group fixed bottom-4 right-4 z-50 flex items-center overflow-hidden rounded-full bg-black/80 text-white shadow-lg backdrop-blur transition-all duration-300 hover:pr-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-sm font-semibold">
        AE
      </span>
      <span className="max-w-0 whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:max-w-[180px] group-hover:pl-1 group-hover:opacity-100">
        Made by Adnan Eram Argho
      </span>
    </Link>
  );
}