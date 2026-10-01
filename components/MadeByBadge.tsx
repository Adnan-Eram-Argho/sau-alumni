"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, Sparkles } from "lucide-react";

// Floating badge — niche dan pashe, ghuranor gradient ring + pulse glow.
// Hover korle boye "Made by..." dekhay.
export default function MadeByBadge() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.4, ease: "backOut" }}
      className="fixed bottom-4 right-4 z-50"
    >
      {/* Pulse glow */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-emerald-400/40"
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />

      <Link
        href="/about"
        aria-label="Made by Adnan Eram Argho"
        className="group relative flex overflow-hidden rounded-full p-[2px] shadow-lg shadow-emerald-500/20 transition-shadow duration-300 hover:shadow-xl hover:shadow-emerald-500/40"
      >
        {/* Rotating gradient ring */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-[-150%]"
          style={{
            background:
              "conic-gradient(from 0deg, #10b981, #fbbf24, #34d399, #f59e0b, #10b981)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner pill */}
        <span className="relative flex items-center rounded-full bg-black/85 backdrop-blur-md transition-all duration-300 group-hover:pr-4">
          {/* Icon circle */}
          <span className="relative m-1 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-amber-400">
            <motion.span
              animate={{ rotate: [0, -12, 12, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              className="flex"
            >
              <Code2 className="h-5 w-5 text-black" strokeWidth={2.5} />
            </motion.span>
            {/* Shine sweep */}
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/50"
              animate={{ left: ["-100%", "200%"] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            />
          </span>

          {/* Hover text */}
          <span className="flex max-w-0 items-center gap-1.5 whitespace-nowrap bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-sm font-semibold text-transparent opacity-0 transition-all duration-300 group-hover:max-w-[220px] group-hover:pl-1 group-hover:opacity-100">
            Made by Adnan Eram Argho
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          </span>
        </span>
      </Link>
    </motion.div>
  );
}