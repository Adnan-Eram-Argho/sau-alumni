import Link from "next/link";
import CountryFlag from "@/components/CountryFlag";
import { BadgeCheck, Mail, Phone, GraduationCap } from "lucide-react";

// Directory card-e dekhano data (server theke asha)
export type AlumniCardData = {
  id: string;
  full_name: string;
  avatar_url: string | null;
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
function describe(p: AlumniCardData): { icon: typeof GraduationCap | null; text: string } {
  if (p.status === "current_student") {
    return { icon: GraduationCap, text: "বর্তমান শিক্ষার্থী" };
  }
  if (p.higher_study_program || p.higher_study_institution) {
    const parts = [p.higher_study_program, p.higher_study_institution].filter(
      Boolean
    );
    return { icon: GraduationCap, text: parts.join(" — ") };
  }
  if (p.current_designation || p.current_company) {
    return {
      icon: null,
      text: [p.current_designation, p.current_company].filter(Boolean).join(" @ "),
    };
  }
  return { icon: null, text: "SAU Alumni" };
}

export default function AlumniCard({
  profile,
  contact,
}: {
  profile: AlumniCardData;
  contact?: ContactInfo;
}) {
  const deptName = profile.departments?.name;
  const description = describe(profile);

  return (
    <Link
      href={`/alumni/${profile.id}`}
      className="glass-card gradient-border block rounded-2xl p-5 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-sau/20"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sau to-sau-hover text-xs font-bold text-white">
                {profile.full_name
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?"}
              </span>
            )}
            <span className="truncate">{profile.full_name}</span>
            {profile.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-sau dark:text-emerald-400" />
            )}
          </h3>
          <p className="mt-1 truncate text-sm text-ink/50">
            {deptName ?? "SAU"}
            {profile.graduation_year ? ` · ব্যাচ ${profile.graduation_year}` : ""}
          </p>
        </div>

        {profile.current_country && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-base px-2.5 py-1 text-xs font-medium text-ink/60">
            <CountryFlag country={profile.current_country} />
            <span className="hidden sm:inline">{profile.current_country}</span>
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 truncate text-sm text-ink/70">
        {description.icon && <description.icon className="h-3.5 w-3.5 shrink-0 text-sau/50" />}
        {description.text}
      </p>

      {contact && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/45">
          {contact.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {contact.email}
            </span>
          )}
          {contact.phone_number && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {contact.phone_number}
            </span>
          )}
        </p>
      )}
    </Link>
  );
}