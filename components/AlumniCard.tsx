import Link from "next/link";
import CountryFlag from "@/components/CountryFlag";

// Directory card-e dekhano data (server theke asha)
export type AlumniCardData = {
  id: string;
  full_name: string;
  graduation_year: number | null;
  status: string | null;
  current_designation: string | null;
  current_company: string | null;
  current_country: string | null;
  higher_study_institution: string | null;
  higher_study_program: string | null;
  is_verified: boolean | null;
  departments: { name: string; faculties: { name: string } } | null;
};

export type ContactInfo = {
  email: string | null;
  phone_number: string | null;
};

// Card-er 3rd line — obostha onujayi ekta line
function describe(p: AlumniCardData): string {
  if (p.status === "current_student") {
    return "বর্তমান শিক্ষার্থী";
  }
  if (p.higher_study_program || p.higher_study_institution) {
    const parts = [p.higher_study_program, p.higher_study_institution].filter(
      Boolean
    );
    return `🎓 ${parts.join(" — ")}`;
  }
  if (p.current_designation || p.current_company) {
    return [p.current_designation, p.current_company].filter(Boolean).join(" @ ");
  }
  return "SAU Alumni";
}

export default function AlumniCard({
  profile,
  contact,
}: {
  profile: AlumniCardData;
  contact?: ContactInfo;
}) {
  const deptName = profile.departments?.name;

  return (
    <Link
      href={`/alumni/${profile.id}`}
      className="block rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <span className="truncate">{profile.full_name}</span>
            {profile.is_verified && (
              <span title="Verified alumni" className="shrink-0 text-sm">
                ✅
              </span>
            )}
          </h3>
          <p className="mt-1 truncate text-sm text-ink/60">
            {deptName ?? "SAU"}
            {profile.graduation_year ? ` · ব্যাচ ${profile.graduation_year}` : ""}
          </p>
        </div>

        {profile.current_country && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-base px-2.5 py-1 text-xs font-medium text-ink/70">
            <CountryFlag country={profile.current_country} />
            <span className="hidden sm:inline">{profile.current_country}</span>
          </span>
        )}
      </div>

      <p className="mt-3 truncate text-sm text-ink/80">{describe(profile)}</p>

      {contact && (
        <p className="mt-3 truncate text-xs text-ink/50">
          ✉️ {contact.email}
          {contact.phone_number ? ` · 📞 ${contact.phone_number}` : ""}
        </p>
      )}
    </Link>
  );
}