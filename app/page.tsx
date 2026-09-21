import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import AnimatedSection from "@/components/AnimatedSection";
import HeroScene from "@/components/HeroScene";
import HeroCarousel from "@/components/HeroCarousel";
import { Search, UserCircle, Megaphone, Briefcase, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "সবাইকে খুঁজে পাও",
    text: "নাম, প্রতিষ্ঠান বা কাজের জায়গা দিয়ে সার্চ — দেশ, বিভাগ ও ব্যাচ অনুযায়ী ফিল্টার।",
    soon: false,
  },
  {
    icon: UserCircle,
    title: "নিজের প্রোফাইল",
    text: "ব্যাচ, এখনকার কাজ, উচ্চশিক্ষার তথ্য — সব এক জায়গায়। কী দেখাবে, সম্পূর্ণ তোমার হাতে।",
    soon: false,
  },
  {
    icon: Megaphone,
    title: "নোটিশ বোর্ড",
    text: "ফ্যাকাল্টি ও বিভাগের আপডেট, ইভেন্ট, দরকারি খবর — এক জায়গায়।",
    soon: false,
  },
  {
    icon: Briefcase,
    title: "চাকরির খবর",
    text: "এলামনাইরা শেয়ার করা চাকরির সুযোগ — সবার জন্য খোলা।",
    soon: true,
  },
];

// Homepage-r JSON-LD — Google-ke bolche ei site ta ki, Organization + search
const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://sau-alumni.vercel.app/#organization",
      name: "SAU Alumni Network",
      alternateName: "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় এলামনাই নেটওয়ার্ক",
      url: "https://sau-alumni.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://sau-alumni.vercel.app/icons/icon-512.png",
        width: 512,
        height: 512,
      },
      description:
        "Sher-e-Bangla Agricultural University (SAU) alumni and current student network — search by name, batch, department, or country.",
      foundingDate: "2025",
      sameAs: [
        "https://github.com/Adnan-Eram-Argho",
        "https://www.linkedin.com/in/md-adnan-eram-argho/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://sau-alumni.vercel.app/#website",
      url: "https://sau-alumni.vercel.app",
      name: "SAU Alumni Network",
      alternateName: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
      publisher: { "@id": "https://sau-alumni.vercel.app/#organization" },
      inLanguage: "bn",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://sau-alumni.vercel.app/directory?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://sau-alumni.vercel.app/#webpage",
      url: "https://sau-alumni.vercel.app",
      name: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
      isPartOf: { "@id": "https://sau-alumni.vercel.app/#website" },
      about: { "@id": "https://sau-alumni.vercel.app/#organization" },
      description:
        "Connect with alumni and current students of Sher-e-Bangla Agricultural University (SAU), Dhaka. Search by name, batch, department, or country — find your batchmates across the world.",
      inLanguage: "bn",
    },
  ],
};

export default async function HomePage() {
  // Admin carousel chobi ache kina?
  const supabase = await createClient();
  const { data: heroImages } = await supabase
    .from("homepage_images")
    .select("id, image_url")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const slides = (heroImages ?? []).map((img) => ({
    id: img.id,
    image_url: img.image_url,
  }));

  return (
    <main>
      {/* Homepage Structured Data — Organization + WebSite + SearchAction */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      {/* HERO — chobi thakle carousel, na thakle 3D design */}
      {slides.length > 0 ? (
        <HeroCarousel slides={slides} />
      ) : (
        <section className="relative overflow-hidden gradient-hero text-white wave-divider">
          {/* 3D background scene */}
          <HeroScene />

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center sm:py-32">
            <AnimatedSection delay={0.1}>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-sm font-medium tracking-wide text-emerald-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় · ঢাকা
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.25}>
              <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-snug sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight">
                এক ক্যাম্পাস, এক পরিবার —{" "}
                <span className="gradient-text">সারা পৃথিবীতে</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-emerald-100/90 sm:text-lg">
                SAU-র প্রাক্তন ও বর্তমান শিক্ষার্থীদের নিজেদের নেটওয়ার্ক। তোমার
                ব্যাচমেট কোথায় আছে — দেশে না বিদেশে — এক সার্চেই খুঁজে নাও।
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.55}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="btn-shimmer group flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 font-semibold text-emerald-950 shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30"
                >
                  যোগ দিন — একদম ফ্রি
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/directory"
                  className="group flex items-center gap-2 rounded-xl border border-emerald-200/30 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:border-emerald-200/50 hover:bg-white/10"
                >
                  ডিরেক্টরি দেখুন
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection>
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            এখানে কী পাবে?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink/60">
            পুরনো বন্ধুত্ব খুঁজে পাওয়া থেকে নতুন সুযোগ — সবই এক জায়গায়।
          </p>
        </AnimatedSection>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.1 + 0.15}>
              <div className="glass-card gradient-border group rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sau/10 to-sau/5 text-sau transition-colors group-hover:from-sau/20 group-hover:to-sau/10 dark:from-emerald-500/15 dark:to-emerald-500/5 dark:text-emerald-400">
                    <f.icon className="h-5.5 w-5.5" />
                  </div>
                  {f.soon && (
                    <span className="flex items-center gap-1.5 rounded-full bg-gold-lighter px-2.5 py-0.5 text-xs font-medium text-gold dark:bg-amber-500/15 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold dark:bg-amber-400" />
                      শীঘ্রই
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  {f.text}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Niche CTA */}
      <section className="relative wave-divider-top">
        <div className="bg-gradient-to-b from-sau/[0.03] to-transparent pt-16">
          <div className="border-y border-line bg-surface/50 backdrop-blur-sm">
            <AnimatedSection>
              <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h2 className="text-2xl font-bold sm:text-3xl">
                  তোমার প্রোফাইল কি এখনো নেই?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-ink/60">
                  ২ মিনিটে অ্যাকাউন্ট খুলে নিজের তথ্য যোগ করো — যেন পুরনো বন্ধুরা
                  তোমাকে খুঁজে পেতে পারে।
                </p>
                <Link
                  href="/auth/signup"
                  className="btn-shimmer mt-8 inline-flex items-center gap-2 rounded-xl bg-sau px-7 py-3.5 font-semibold text-white shadow-lg shadow-sau/20 transition-all hover:bg-sau-hover hover:shadow-xl hover:shadow-sau/30"
                >
                  অ্যাকাউন্ট খুলুন
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </main>
  );
}