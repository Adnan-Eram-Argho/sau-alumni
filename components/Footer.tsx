import Link from "next/link";
import { Search, Megaphone, Info, Heart, BookOpen, ExternalLink } from "lucide-react";

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
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sau text-white shadow-md">
                <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M16 28c0-6 0-10 0-14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M16 20c-3-1-6-3-7-7 4 0 6 2 7 5" fill="currentColor" opacity="0.85" />
                  <path d="M16 16c3-1 6-4 7-8-4 0-6 3-7 6" fill="currentColor" opacity="0.85" />
                  <polygon points="16,4 6,9 16,14 26,9" fill="currentColor" />
                  <rect x="14" y="9" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
                  <path d="M6,9 L6,13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="6" cy="14" r="1" fill="currentColor" />
                  <path d="M10 28q6-2 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
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
          <div className="flex flex-col items-center gap-3 sm:items-end">
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

            {/* SAU Study Platform — sister project */}
            <a
              href="https://sau-eco-qstns.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-xl border border-sau/20 bg-sau/5 px-4 py-2 text-sm font-medium text-sau transition-all hover:border-sau/40 hover:bg-sau/10 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10"
            >
              <BookOpen className="h-4 w-4" />
              SAU Study Platform
              <ExternalLink className="h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5" />
            </a>
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