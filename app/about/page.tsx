import Link from "next/link";

export const metadata = {
  title: "আমাদের সম্পর্কে — SAU Alumni",
  description:
    "SAU Alumni Network — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও বর্তমান শিক্ষার্থীদের নিজেদের সংযোগস্থল। এক ক্যাম্পাসের মানুষ, সারা পৃথিবীতে।",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">আমাদের সম্পর্কে</h1>
      <p className="mt-1 text-ink/60">
        এক ক্যাম্পাসের মানুষ, সারা পৃথিবীতে ছড়িয়ে — এবার এক জায়গায়।
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold">এটা কী?</h2>
          <p className="mt-3 leading-relaxed text-ink/80">
            SAU Alumni Network হলো শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও
            বর্তমান শিক্ষার্থীদের নিজেদের একটি সংযোগস্থল। এখানে তুমি খুঁজে পাবে
            তোমার ব্যাচমেটদের — কে দেশে আর কে বিদেশে, কে কোন প্রতিষ্ঠানে কাজ
            করছে, কে কোথায় উচ্চশিক্ষা নিচ্ছে। বিশ্বাসটা সহজ — বিশ্ববিদ্যালয়ের
            বন্ধুত্ব ছাত্রজীবন শেষ হলেও আসলে শেষ হয় না।
          </p>
          <p className="mt-3 leading-relaxed text-ink/80">
            প্ল্যাটফর্মটি সম্পূর্ণ বিনামূল্যে — তৈরি এবং পরিচালিত alumni-দের
            নিজেদের উদ্যোগে।
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold">শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়</h2>
          <p className="mt-3 leading-relaxed text-ink/80">
            শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় (SAU), শেরে-বাংলা নগর, ঢাকা —
            বাংলাদেশের কৃষি শিক্ষা ও গবেষণার অন্যতম প্রধান প্রতিষ্ঠান। এর
            মূলমন্ত্র:
          </p>
          <p className="mt-3 rounded-xl bg-base p-4 text-center font-semibold tracking-wide text-sau dark:text-emerald-300">
            গবেষণা · শিক্ষা · সম্প্রসারণ
          </p>
          <p className="mt-3 text-center text-sm tracking-wide text-ink/70">
            Research · Education · Extension
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold">নির্মাতা</h2>
          <p className="mt-3 leading-relaxed text-ink/80">
            এই প্ল্যাটফর্মটি ডিজাইন ও নির্মাণ করেছেন{" "}
            <span className="font-semibold text-gold">Adnan Eram Argho</span>।
            কোনো বাণিজ্যিক স্বার্থ নেই — উদ্দেশ্য একটাই: SAU-র মানুষগুলো এক
            জায়গায় খুঁজে পাক।
          </p>
        </section>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/auth/signup"
            className="rounded-xl bg-sau px-6 py-3 font-semibold text-white transition hover:bg-sau-hover"
          >
            যোগ দিন
          </Link>
          <Link
            href="/directory"
            className="rounded-xl border border-line bg-surface px-6 py-3 font-semibold transition hover:bg-base"
          >
            ডিরেক্টরি দেখুন
          </Link>
        </div>
      </div>
    </div>
  );
}