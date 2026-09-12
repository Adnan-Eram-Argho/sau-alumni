import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-bold text-sau dark:text-emerald-300">
              SAU Alumni Network
            </p>
            <p className="mt-1 text-ink/60">শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়, ঢাকা</p>
            <p className="mt-0.5 text-xs text-ink/50">গবেষণা · শিক্ষা · সম্প্রসারণ</p>
          </div>
          <p className="text-ink/60">
            Built by{" "}
            <Link href="/about" className="font-medium text-gold hover:underline">
              Adnan Eram Argho
            </Link>{" "}
            →
          </p>
        </div>
      </div>
    </footer>
  );
}