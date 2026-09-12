import Link from "next/link";

const features = [
  {
    emoji: "🔍",
    title: "সবাইকে খুঁজে পাও",
    text: "নাম, প্রতিষ্ঠান বা কাজের জায়গা দিয়ে সার্চ — দেশ, বিভাগ ও ব্যাচ অনুযায়ী ফিল্টার।",
    soon: false,
  },
  {
    emoji: "👤",
    title: "নিজের প্রোফাইল",
    text: "ব্যাচ, এখনকার কাজ, উচ্চশিক্ষার তথ্য — সব এক জায়গায়। কী দেখাবে, সম্পূর্ণ তোমার হাতে।",
    soon: false,
  },
  {
    emoji: "📢",
    title: "নোটিশ বোর্ড",
    text: "ফ্যাকাল্টি ও বিভাগের আপডেট, ইভেন্ট, দরকারি খবর — এক জায়গায়।",
    soon: true,
  },
  {
    emoji: "💼",
    title: "চাকরির খবর",
    text: "এলামনাইরা শেয়ার করা চাকরির সুযোগ — সবার জন্য খোলা।",
    soon: true,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero — sobar prothom dekha */}
      <section className="bg-sau text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <p className="text-sm font-medium tracking-wide text-emerald-200">
            শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় · ঢাকা
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-snug sm:text-5xl sm:leading-tight">
            এক ক্যাম্পাস, এক পরিবার —{" "}
            <span className="text-amber-300">সারা পৃথিবীতে</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-emerald-100 sm:text-lg">
            SAU-র প্রাক্তন ও বর্তমান শিক্ষার্থীদের নিজেদের নেটওয়ার্ক। তোমার
            ব্যাচমেট কোথায় আছে — দেশে না বিদেশে — এক সার্চেই খুঁজে নাও।
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-emerald-950 transition hover:bg-amber-300"
            >
              যোগ দিন — একদম ফ্রি
            </Link>
            <Link
              href="/directory"
              className="rounded-xl border border-emerald-200/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              ডিরেক্টরি দেখুন
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          এখানে কী পাবে?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink/60">
          পুরনো বন্ধুত্ব খুঁজে পাওয়া থেকে নতুন সুযোগ — সবই এক জায়গায়।
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{f.emoji}</span>
                {f.soon && (
                  <span className="rounded-full bg-base px-2.5 py-0.5 text-xs font-medium text-ink/60">
                    শীঘ্রই
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Niche CTA */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            তোমার প্রোফাইল কি এখনো নেই?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            ২ মিনিটে অ্যাকাউন্ট খুলে নিজের তথ্য যোগ করো — যেন পুরনো বন্ধুরা
            তোমাকে খুঁজে পেতে পারে।
          </p>
          <Link
            href="/auth/signup"
            className="mt-6 inline-block rounded-xl bg-sau px-6 py-3 font-semibold text-white transition hover:bg-sau-hover"
          >
            অ্যাকাউন্ট খুলুন
          </Link>
        </div>
      </section>
    </div>
  );
}