import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import CountryFlag from "@/components/CountryFlag";

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
    .select("full_name, bio, is_public, deleted_at")
    .eq("id", id)
    .maybeSingle();

  const profile = data as {
    full_name: string;
    bio: string | null;
    is_public: boolean | null;
    deleted_at: string | null;
  } | null;

  if (!profile || !profile.is_public || profile.deleted_at) {
    return { title: "প্রোফাইল পাওয়া যায়নি — SAU Alumni" };
  }

  const description =
    profile.bio?.slice(0, 150) ??
    `${profile.full_name} — Sher-e-Bangla Agricultural University alumni.`;

  return {
    title: `${profile.full_name} — SAU Alumni`,
    description,
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
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Sher-e-Bangla Agricultural University",
      },
      ...(p.current_designation ? { jobTitle: p.current_designation } : {}),
      ...(p.current_company
        ? { worksFor: { "@type": "Organization", name: p.current_company } }
        : {}),
      ...(c?.email ? { email: c.email } : {}),
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/directory"
        className="text-sm font-medium text-ink/60 hover:text-ink"
      >
        ← ডিরেক্টরিতে ফিরুন
      </Link>

      {isPrivate && (
        <p className="mt-4 rounded-xl border border-amber-300/60 bg-amber-100/60 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          🔒 এই প্রোফাইলটি এখন private — শুধু তুমি নিজেই দেখতে পাচ্ছো। বন্ধুরা
          যেন খুঁজে পায়, প্রোফাইলটি public করে দাও (profile edit-er option)।
        </p>
      )}

      {/* Identity card */}
      <div className="mt-6 flex flex-wrap items-start gap-5 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        {p.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.avatar_url}
            alt={p.full_name}
            className="h-20 w-20 shrink-0 rounded-full border-2 border-sau object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sau text-2xl font-bold text-white">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">
            <span>{p.full_name}</span>
            {p.is_verified && (
              <span title="Verified alumni" className="text-lg">
                ✅
              </span>
            )}
          </h1>
          <p className="mt-1 text-ink/60">
            {[dept, faculty].filter(Boolean).join(" · ") || "SAU"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-base px-3 py-1 font-medium">
              {p.status === "current_student"
                ? "🎓 বর্তমান শিক্ষার্থী"
                : "SAU Alumni"}
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

      {/* Ekhonkar obostha */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold">এখনকার অবস্থা</h2>
        {p.higher_study_program || p.higher_study_institution ? (
          <p className="mt-2">
            🎓{" "}
            {[p.higher_study_program, p.higher_study_institution]
              .filter(Boolean)
              .join(" — ")}
          </p>
        ) : p.current_designation || p.current_company ? (
          <p className="mt-2">
            💼{" "}
            {[p.current_designation, p.current_company]
              .filter(Boolean)
              .join(" @ ")}
          </p>
        ) : (
          <p className="mt-2 text-sm text-ink/50">তথ্য এখনো যোগ করা হয়নি।</p>
        )}
      </div>

      {/* Bio */}
      {p.bio && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold">পরিচিতি</h2>
          <p className="mt-2 whitespace-pre-line text-ink/80">{p.bio}</p>
        </div>
      )}

      {/* Contact */}
      {(c?.email || c?.phone_number || p.linkedin_url) && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold">যোগাযোগ</h2>
          <div className="mt-3 space-y-2 text-sm">
            {c?.email && (
              <a
                href={`mailto:${c.email}`}
                className="block break-all text-sau hover:underline dark:text-emerald-300"
              >
                ✉️ {c.email}
              </a>
            )}
            {c?.phone_number && <p className="break-all">📞 {c.phone_number}</p>}
            {p.linkedin_url && (
              <a
                href={p.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all text-sau hover:underline dark:text-emerald-300"
              >
                in — LinkedIn প্রোফাইল
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}