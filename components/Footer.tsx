import Link from "next/link";
import { Search, Megaphone, Info, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-surface">
      {/* Gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sau/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand block */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2.5 sm:justify-start">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sau text-sm font-black text-white shadow-md">
                SAU
              </span>
              <span className="text-lg font-bold text-sau dark:text-emerald-300">
                SAU Alumni Network
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/60">
              শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়, ঢাকা
            </p>
            <p className="mt-1 text-xs tracking-wider text-ink/40">
              গবেষণা · শিক্ষা · সম্প্রসারণ
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm sm:justify-end">
            <Link
              href="/directory"
              className="flex items-center gap-1.5 text-ink/60 transition-colors hover:text-sau dark:hover:text-emerald-300"
            >
              <Search className="h-3.5 w-3.5" />
              ডিরেক্টরি
            </Link>
            <Link
              href="/notices"
              className="flex items-center gap-1.5 text-ink/60 transition-colors hover:text-sau dark:hover:text-emerald-300"
            >
              <Megaphone className="h-3.5 w-3.5" />
              নোটিশ
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-1.5 text-ink/60 transition-colors hover:text-sau dark:hover:text-emerald-300"
            >
              <Info className="h-3.5 w-3.5" />
              আমাদের সম্পর্কে
            </Link>
          </div>
        </div>

        {/* Bottom bar — legal links soho */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink/40 sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-1.5">
            <span>© {new Date().getFullYear()} SAU Alumni Network</span>
            <span className="hidden sm:inline">·</span>
            <Link
              href="/privacy"
              className="transition-colors hover:text-ink/70 hover:underline"
            >
              গোপনীয়তা নীতি
            </Link>
            <span>·</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-ink/70 hover:underline"
            >
              শর্তাবলী
            </Link>
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-gold" /> by{" "}
            <Link
              href="/about"
              className="font-medium text-gold transition-colors hover:text-gold-light hover:underline"
            >
              Adnan Eram Argho
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}