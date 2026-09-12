import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import AlumniCard, {
  type AlumniCardData,
  type ContactInfo,
} from "@/components/AlumniCard";
import DirectoryFilters from "@/components/DirectoryFilters";

const PAGE_SIZE = 24;

type DirectoryProfile = AlumniCardData & { created_at: string };

export const metadata = {
  title: "Alumni ডিরেক্টরি — SAU Alumni",
  description:
    "Sher-e-Bangla Agricultural University-er sob alumni ar current student-der khunje dekho — department, batch, desh onujayi.",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Next.js 15: searchParams Promise — await korte hoy
  const params = await searchParams;
  const before = typeof params.before === "string" ? params.before : null;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const facultyId =
    typeof params.faculty === "string" && params.faculty ? params.faculty : null;
  const loc = params.loc === "bd" || params.loc === "abroad" ? params.loc : "all";
  const country =
    typeof params.country === "string" && params.country ? params.country : null;

  const supabase = await createClient();

  // Filter dropdown-er khabar
  const { data: faculties } = await supabase
    .from("faculties")
    .select("id, name")
    .order("name");

  const { data: countryRows } = await supabase
    .from("profiles")
    .select("current_country")
    .eq("is_public", true)
    .is("deleted_at", null)
    .neq("current_country", "Bangladesh");

  const countries = Array.from(
    new Set(
      (countryRows ?? [])
        .map((r) => r.current_country)
        .filter((c): c is string => !!c)
    )
  ).sort();

  // Faculty filter → oi faculty-r department-id gulo
  let departmentIds: string[] | null = null;
  if (facultyId) {
    const { data: depts } = await supabase
      .from("departments")
      .select("id")
      .eq("faculty_id", facultyId);
    departmentIds = (depts ?? []).map((d) => d.id);
  }

  // Sob filter + pagination EK-I query-te (spec Section 27)
  function baseQuery() {
    let query = supabase
      .from("profiles")
      .select(
        `id, full_name, avatar_url, graduation_year, status, current_designation, current_company,
         current_country, higher_study_institution, higher_study_program, is_verified,
         created_at, departments(name, faculties(name))`
      )
      .eq("is_public", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (before) query = query.lt("created_at", before);
    if (loc === "bd") {
      query = query.eq("current_country", "Bangladesh");
    } else if (loc === "abroad") {
      if (country) query = query.eq("current_country", country);
      else query = query.neq("current_country", "Bangladesh");
    }
    if (departmentIds) query = query.in("department_id", departmentIds);

    return query;
  }

  let profiles: DirectoryProfile[] = [];
  let queryError: string | null = null;

  // Faculty-te department na thakle list faka (thik-i)
  if (departmentIds === null || departmentIds.length > 0) {
    let query = baseQuery();

    if (q) {
      // Prothom attempt: full-text search (spec Section 27)
      query = query.textSearch("search_vector", q, {
        type: "websearch",
        config: "english",
      });
    }

    const res = await query;
    profiles = (res.data ?? []) as unknown as DirectoryProfile[];
    queryError = res.error ? res.error.message : null;

    // Na pele ba error: partial-name fallback — "argh"
    // likhleo "Argho" pabe (trgm index eke fast rakhe)
    if (q && (queryError || profiles.length === 0)) {
      const likeTerm = q.replace(/[,()]/g, " ").trim();
      if (likeTerm) {
        const res2 = await baseQuery().or(
          `full_name.ilike.%${likeTerm}%,current_company.ilike.%${likeTerm}%,current_designation.ilike.%${likeTerm}%`
        );
         profiles = (res2.data ?? []) as unknown as DirectoryProfile[];
        queryError = res2.error ? res2.error.message : null;
      }
    }
  }

  // Contact info — raw table NA, VIEW theke (spec Section 25)
  const contactMap: Record<string, ContactInfo> = {};

  if (profiles.length > 0) {
    const { data: contacts } = await supabase
      .from("public_contact_info")
      .select("profile_id, email, phone_number")
      .in(
        "profile_id",
        profiles.map((p) => p.id)
      );

    (contacts ?? []).forEach((c) => {
      contactMap[c.profile_id] = {
        email: c.email,
        phone_number: c.phone_number,
      };
    });
  }

  const hasMore = profiles.length === PAGE_SIZE;
  const lastCreatedAt =
    profiles.length > 0 ? profiles[profiles.length - 1].created_at : null;

  // "Ar o dekhun" link-e sob thaka filter roye jay
  function pageUrl(cursor: string) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (facultyId) sp.set("faculty", facultyId);
    if (loc !== "all") sp.set("loc", loc);
    if (country) sp.set("country", country);
    sp.set("before", cursor);
    return `/directory?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Alumni ডিরেক্টরি</h1>
        <p className="mt-1 text-ink/60">
          {q
            ? `"${q}" — ${profiles.length} জন পাওয়া গেলো`
            : loc === "bd"
              ? "বাংলাদেশে থাকা SAU-র সদস্যরা"
              : loc === "abroad"
                ? "বিদেশে থাকা SAU-র সদস্যরা"
                : "SAU-র প্রাক্তন ও বর্তমান শিক্ষার্থীরা"}
        </p>
      </div>

      <DirectoryFilters
        faculties={(faculties ?? []) as { id: string; name: string }[]}
        countries={countries}
      />

      {queryError ? (
        <p className="mt-10 rounded-xl border border-line bg-surface p-6 text-center text-ink/70">
          ডেটা আনতে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।
        </p>
      ) : profiles.length === 0 ? (
        <p className="mt-10 rounded-xl border border-line bg-surface p-6 text-center text-ink/70">
          {q
            ? "এই নামে কাউকে খুঁজে পাওয়া যায়নি। বানানটা একবার দেখে নাও।"
            : "এখনো কোনো public প্রোফাইল নেই। সবার আগে যোগ দিন!"}
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <AlumniCard key={p.id} profile={p} contact={contactMap[p.id]} />
          ))}
        </div>
      )}

      {hasMore && lastCreatedAt && (
        <div className="mt-10 text-center">
          <Link
            href={pageUrl(lastCreatedAt)}
            className="inline-block rounded-xl border border-line bg-surface px-6 py-2.5 font-medium hover:bg-base"
          >
            আরও দেখুন ↓
          </Link>
        </div>
      )}
    </div>
  );
}