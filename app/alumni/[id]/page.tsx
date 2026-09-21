import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import CountryFlag from "@/components/CountryFlag";
import AnimatedSection from "@/components/AnimatedSection";
import {
  BadgeCheck,
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  ArrowLeft,
  Lock,
  User,
} from "lucide-react";

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

type ProfileData = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  graduation_year: number | null;
  status: string | null;
  current_designation: string | null;
  current_company: string | null;
  linkedin_url: string | null;
  current_country: string | null;
  higher_study_institution: string | null;
  higher_study_program: string | null;
  is_verified: boolean | null;
  is_public: boolean | null;
  deleted_at: string | null;
  departments: { name: string; faculties: { name: string } } | null;
};

type ContactData = {
  email: string | null;
  phone_number: string | null;
};

// Prottek profile-r nijasro title/description (SEO — spec Section 6)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("full_name, bio, is_public, deleted_at, current_designation, current_company, avatar_url")
    .eq("id", id)
    .maybeSingle();

  const profile = data as {
    full_name: string;
    bio: string | null;
    is_public: boolean | null;
    deleted_at: string | null;
    current_designation: string | null;
    current_company: string | null;
    avatar_url: string | null;
  } | null;

  if (!profile || !profile.is_public || profile.deleted_at) {
    return { title: "প্রোফাইল পাওয়া যায়নি" };
  }

  const description =
    profile.bio?.slice(0, 150) ??
    [profile.full_name, profile.current_designation, profile.current_company]
      .filter(Boolean)
      .join(" — ") +
      " — Sher-e-Bangla Agricultural University (SAU) alumni.";

  return {
    title: `${profile.full_name}`,
    description,
    alternates: {
      canonical: `https://sau-alumni.vercel.app/alumni/${id}`,
    },
    openGraph: {
      title: `${profile.full_name} — SAU Alumni`,
      description,
      type: "profile",
      url: `https://sau-alumni.vercel.app/alumni/${id}`,
      ...(profile.avatar_url
        ? { images: [{ url: profile.avatar_url, width: 400, height: 400, alt: profile.full_name }] }
        : {}),
    },
  };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Thik UUID na holei 404 (DB error thekai dey)
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(
      `id, full_name, avatar_url, bio, graduation_year, status,
       current_designation, current_company, linkedin_url,
       current_country, higher_study_institution, higher_study_program,
       is_verified, is_public, deleted_at,
       departments(name, faculties(name))`
    )
    .eq("id", id)
    .maybeSingle();

    const p = data as unknown as ProfileData | null;

  // RLS er karone onno karo PRIVATE profile ekhene ashbei na —
  // privacy database-i rokko kore. Na pele 404.
  if (!p || p.deleted_at) {
    notFound();
  }

  // Row esheche + private → mane malik nijei dekhchhe
  const isPrivate = p.is_public === false;

  // Contact VIEW theke — phone shudhu visibility-rule onujayi
  const { data: contactData } = await supabase
    .from("public_contact_info")
    .select("email, phone_number")
    .eq("profile_id", id)
    .maybeSingle();

  const c = contactData as ContactData | null;

  const dept = p.departments?.name;
  const faculty = p.departments?.faculties?.name;

  const initials =
    p.full_name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  // Google-r kache "ei ekjon SAU alumni" — sonchinno chobi (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: p.full_name,
      url: `https://sau-alumni.vercel.app/alumni/${p.id}`,
      ...(p.avatar_url ? { image: p.avatar_url } : {}),
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Sher-e-Bangla Agricultural University",
        sameAs: "https://sau.edu.bd",
      },
      ...(p.current_designation ? { jobTitle: p.current_designation } : {}),
      ...(p.current_company
        ? { worksFor: { "@type": "Organization", name: p.current_company } }
        : {}),
      ...(c?.email ? { email: c.email } : {}),
      ...(p.current_country ? { nationality: p.current_country } : {}),
    },
  };

  // Breadcrumb — Google search e "SAU Alumni > Directory > Name" dekhabe
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "হোম",
        item: "https://sau-alumni.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ডিরেক্টরি",
        item: "https://sau-alumni.vercel.app/directory",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: p.full_name,
        item: `https://sau-alumni.vercel.app/alumni/${p.id}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <AnimatedSection>
        <Link
          href="/directory"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 transition-colors hover:text-sau dark:hover:text-emerald-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          ডিরেক্টরিতে ফিরুন
        </Link>
      </AnimatedSection>

      {isPrivate && (
        <AnimatedSection delay={0.1}>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/60 bg-amber-100/60 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              এই প্রোফাইলটি এখন private — শুধু তুমি নিজেই দেখতে পাচ্ছো। বন্ধুরা
              যেন খুঁজে পায়, প্রোফাইলটি public করে দাও (profile edit-er option)।
            </p>
          </div>
        </AnimatedSection>
      )}

      {/* Identity card */}
      <AnimatedSection delay={0.15}>
        <div className="mt-6 glass-card flex flex-wrap items-start gap-5 rounded-2xl p-6">
          {p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.avatar_url}
              alt={p.full_name}
              className="h-20 w-20 shrink-0 rounded-full object-cover ring-3 ring-sau/20"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sau to-sau-hover text-2xl font-bold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">
              <span>{p.full_name}</span>
              {p.is_verified && (
                <BadgeCheck className="h-5 w-5 text-sau dark:text-emerald-400" />
              )}
            </h1>
            <p className="mt-1 text-ink/50">
              {[dept, faculty].filter(Boolean).join(" · ") || "SAU"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-full bg-base px-3 py-1 font-medium">
                {p.status === "current_student" ? (
                  <>
                    <GraduationCap className="h-3.5 w-3.5 text-sau/60" />
                    বর্তমান শিক্ষার্থী
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5 text-sau/60" />
                    SAU Alumni
                  </>
                )}
              </span>
              {p.graduation_year && (
                <span className="rounded-full bg-base px-3 py-1 font-medium">
                  ব্যাচ {p.graduation_year}
                </span>
              )}
              {p.current_country && (
                <span className="flex items-center gap-1.5 rounded-full bg-base px-3 py-1 font-medium">
                  <CountryFlag country={p.current_country} />
                  {p.current_country}
                </span>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Ekhonkar obostha */}
      <AnimatedSection delay={0.25}>
        <div className="mt-6 glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold">এখনকার অবস্থা</h2>
          {p.higher_study_program || p.higher_study_institution ? (
            <p className="mt-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 shrink-0 text-sau/60" />
              {[p.higher_study_program, p.higher_study_institution]
                .filter(Boolean)
                .join(" — ")}
            </p>
          ) : p.current_designation || p.current_company ? (
            <p className="mt-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4 shrink-0 text-sau/60" />
              {[p.current_designation, p.current_company]
                .filter(Boolean)
                .join(" @ ")}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink/40">তথ্য এখনো যোগ করা হয়নি।</p>
          )}
        </div>
      </AnimatedSection>

      {/* Bio */}
      {p.bio && (
        <AnimatedSection delay={0.3}>
          <div className="mt-6 glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold">পরিচিতি</h2>
            <p className="mt-2 whitespace-pre-line text-ink/70 leading-relaxed">{p.bio}</p>
          </div>
        </AnimatedSection>
      )}

      {/* Contact */}
      {(c?.email || c?.phone_number || p.linkedin_url) && (
        <AnimatedSection delay={0.35}>
          <div className="mt-6 glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold">যোগাযোগ</h2>
            <div className="mt-3 space-y-2.5 text-sm">
              {c?.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-2.5 break-all text-sau transition-colors hover:underline dark:text-emerald-300"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {c.email}
                </a>
              )}
              {c?.phone_number && (
                <p className="flex items-center gap-2.5 break-all">
                  <Phone className="h-4 w-4 shrink-0 text-ink/40" />
                  {c.phone_number}
                </p>
              )}
              {p.linkedin_url && (
                <a
                  href={p.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 break-all text-sau transition-colors hover:underline dark:text-emerald-300"
                >
                  <LinkedinIcon className="h-4 w-4 shrink-0" />
                  LinkedIn প্রোফাইল
                </a>
              )}
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}