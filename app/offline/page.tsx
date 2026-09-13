import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { WifiOff, RefreshCw } from "lucide-react";

export const metadata = {
  title: "অফলাইন — SAU Alumni",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <AnimatedSection>
        <WifiOff className="mx-auto h-14 w-14 text-ink/20" />
        <h1 className="mt-4 text-2xl font-bold">ইন্টারনেট সংযোগ নেই</h1>
        <p className="mt-2 text-ink/60">
          আপনি এখন অফলাইনে আছেন। ইন্টারনেট ফিরলে আবার চেষ্টা করুন।
        </p>
        <Link
          href="/"
          className="btn-shimmer mt-6 inline-flex items-center gap-2 rounded-xl bg-sau px-6 py-2.5 font-semibold text-white hover:bg-sau-hover"
        >
          <RefreshCw className="h-4 w-4" />
          আবার চেষ্টা করুন
        </Link>
      </AnimatedSection>
    </div>
  );
}