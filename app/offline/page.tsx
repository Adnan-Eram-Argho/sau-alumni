import Link from "next/link";

export const metadata = {
  title: "অফলাইন — SAU Alumni",
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl">📴</span>
      <h1 className="mt-4 text-2xl font-bold">ইন্টারনেট সংযোগ নেই</h1>
      <p className="mt-2 text-ink/70">
        আপনি এখন অফলাইনে আছেন। ইন্টারনেট ফিরলে আবার চেষ্টা করুন।
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-sau px-6 py-2.5 font-semibold text-white hover:bg-sau-hover"
      >
        আবার চেষ্টা করুন
      </Link>
    </div>
  );
}