import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowRight, Heart } from "lucide-react";

export const metadata = {
  title: "আমাদের সম্পর্কে — SAU Alumni",
  description:
    "SAU Alumni Network — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও বর্তমান শিক্ষার্থীদের নিজেদের সংযোগস্থল। এক ক্যাম্পাসের মানুষ, সারা পৃথিবীতে।",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AnimatedSection>
        <h1 className="text-2xl font-bold sm:text-3xl">আমাদের সম্পর্কে</h1>
        <p className="mt-1 text-ink/50">
          এক ক্যাম্পাসের মানুষ, সারা পৃথিবীতে ছড়িয়ে — এবার এক জায়গায়।
        </p>
      </AnimatedSection>

      <div className="mt-8 space-y-6">
        <AnimatedSection delay={0.1}>
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold">এটা কী?</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              SAU Alumni Network হলো শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও
              বর্তমান শিক্ষার্থীদের নিজেদের একটি সংযোগস্থল। এখানে তুমি খুঁজে পাবে
              তোমার ব্যাচমেটদের — কে দেশে আর কে বিদেশে, কে কোন প্রতিষ্ঠানে কাজ
              করছে, কে কোথায় উচ্চশিক্ষা নিচ্ছে। বিশ্বাসটা সহজ — বিশ্ববিদ্যালয়ের
              বন্ধুত্ব ছাত্রজীবন শেষ হলেও আসলে শেষ হয় না।
            </p>
            <p className="mt-3 leading-relaxed text-ink/70">
              প্ল্যাটফর্মটি সম্পূর্ণ বিনামূল্যে — তৈরি এবং পরিচালিত alumni-দের
              নিজেদের উদ্যোগে।
            </p>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold">শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় (SAU), শেরে-বাংলা নগর, ঢাকা —
              বাংলাদেশের কৃষি শিক্ষা ও গবেষণার অন্যতম প্রধান প্রতিষ্ঠান। এর
              মূলমন্ত্র:
            </p>
            <div className="mt-4 rounded-xl bg-gradient-to-r from-sau/5 via-sau/10 to-sau/5 p-5 text-center dark:from-emerald-500/5 dark:via-emerald-500/10 dark:to-emerald-500/5">
              <p className="text-lg font-semibold tracking-wide text-sau dark:text-emerald-300">
                গবেষণা · শিক্ষা · সম্প্রসারণ
              </p>
              <p className="mt-2 text-sm tracking-wide text-ink/50">
                Research · Education · Extension
              </p>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold">নির্মাতা</h2>
            <p className="mt-3 leading-relaxed text-ink/70">
              এই প্ল্যাটফর্মটি ডিজাইন ও নির্মাণ করেছেন{" "}
              <span className="font-semibold text-gold">Adnan Eram Argho</span>।
              কোনো বাণিজ্যিক স্বার্থ নেই — উদ্দেশ্য একটাই: SAU-র মানুষগুলো এক
              জায়গায় খুঁজে পাক।
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/40">
              <Heart className="h-3.5 w-3.5 text-gold" />
              Built with love for SAU
            </p>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/auth/signup"
              className="btn-shimmer group flex items-center gap-2 rounded-xl bg-sau px-6 py-3 font-semibold text-white shadow-lg shadow-sau/15 transition-all hover:bg-sau-hover hover:shadow-xl"
            >
              যোগ দিন
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/directory"
              className="rounded-xl border border-line bg-surface px-6 py-3 font-semibold transition-all hover:border-sau/30 hover:bg-sau/5"
            >
              ডিরেক্টরি দেখুন
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}