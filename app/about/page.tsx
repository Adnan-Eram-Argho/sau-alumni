import Link from "next/link";
import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import {
  ArrowRight,
  Heart,
  Mail,
  ExternalLink,
} from "lucide-react";


function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.66 1.66 0 0 0-1.66-1.66Z" />
    </svg>
  );
}

export const metadata = {
  title: "আমাদের সম্পর্কে — SAU Alumni",
  description:
    "SAU Alumni Network — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও বর্তমান শিক্ষার্থীদের নিজেদের সংযোগস্থল। এক ক্যাম্পাসের মানুষ, সারা পৃথিবীতে।",
};


const SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Express",
  "Supabase",
  "PostgreSQL",
  "MongoDB",
  "Firebase",
  "Tailwind CSS",
  "Python",
  "C++",
  "Algorithms & Data Structures",
];

const PROJECTS = [
  {
    name: "SAU Alumni Network",
    desc: "এই প্ল্যাটফর্ম — role-based auth, secure admin system সহ শূন্য বাজেটে তৈরি।",
    href: "https://sau-alumni.vercel.app/", // এই সাইটের নিজের লিংক — homepage দিতে পারো
  },
  {
    name: "SAU Study Platform",
    desc: "React + Node + Supabase দিয়ে বানানো, ১৬২টি কোর্স কভার করে।",
    href: "https://sau-eco-qstns.vercel.app/", // এখানে লাইভ লিংক বসাও
  },
  {
    name: "Rice AI Doctor",
    desc: "ধানের রোগ শনাক্তকারী custom AI মডেল — অফলাইন PWA, বাংলাদেশি field data দিয়ে ট্রেইনড, ৯৪% accuracy।",
    href: "https://rice-ai-app.vercel.app/", // GithubIcon repo লিংক বসাও
  },
  {
    name: "MONOPOLY game ",
    desc: "A monopoly game based off bangladesh",
    href: "https://arghor-monopoly.vercel.app/",
  },
];

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

        {/* ---- নির্মাতা: mini-portfolio ---- */}
        <AnimatedSection delay={0.3}>
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold">নির্মাতা</h2>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-sau/30 shadow-lg sm:h-24 sm:w-24">
                <Image
                  src="/images/creator.jpg"
                  alt="Adnan-Eram Argho"
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <p className="text-base font-semibold text-ink">
                  Adnan-Eram Argho
                </p>
                <p className="text-sm font-medium text-sau dark:text-emerald-300">
                  Full-Stack Developer & AI Engineer
                </p>
                <p className="mt-2 leading-relaxed text-ink/70">
                  Sher-e-Bangla Agricultural University-র Agricultural
                  Economics-এর শিক্ষার্থী এবং সম্পূর্ণ self-taught full-stack
                  developer, ৪+ বছরের কোডিং অভিজ্ঞতা নিয়ে। কোনো CSE ডিগ্রি
                  ছাড়াই React, Next.js, Node.js, Supabase, এবং Machine
                  Learning-এ real, production-level প্রোডাক্ট বানানোর দক্ষতা
                  অর্জন করেছেন — এবং সেগুলো ব্যবহার করেছেন কৃষি ও ক্যাম্পাস
                  কমিউনিটির আসল সমস্যা সমাধানে।
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink/70"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Projects */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-ink/80">
                অন্যান্য প্রজেক্ট
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {PROJECTS.map((project) => (
                  <Link
                    key={project.name}
                    href={project.href}
                    className="group flex flex-col rounded-xl border border-line bg-surface p-4 transition-all hover:border-sau/30 hover:bg-sau/5"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                      {project.name}
                      <ExternalLink className="h-3 w-3 text-ink/40 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1.5 text-xs leading-relaxed text-ink/60">
                      {project.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="https://github.com/Adnan-Eram-Argho"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink/60 transition-colors hover:border-sau/30 hover:text-sau"
              >
                <GithubIcon className="h-4 w-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/md-adnan-eram-argho/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink/60 transition-colors hover:border-sau/30 hover:text-sau"
              >
                <LinkedinIcon className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink/60 transition-colors hover:border-sau/30 hover:text-sau"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-ink/70">
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