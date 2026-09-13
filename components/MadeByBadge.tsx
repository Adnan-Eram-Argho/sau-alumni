"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// Floating badge — niche dan pashe ghuri thake,
// hover korle boye "Made by..." dekhay (spec Section 9)
export default function MadeByBadge() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.4, ease: "backOut" }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Link
        href="/about"
        aria-label="Made by Adnan Eram Argho"
        className="group flex items-center overflow-hidden rounded-full bg-black/70 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black/85 hover:pr-4 hover:shadow-xl"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-sm font-semibold">
          AE
        </span>
        <span className="max-w-0 whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:max-w-[180px] group-hover:pl-1 group-hover:opacity-100">
          Made by Adnan Eram Argho
        </span>
      </Link>
    </motion.div>
  );
}