import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";

type FacultyData = {
  id: string;
  name: string;
  slug: string;
  code: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("faculties")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    return { title: "ফ্যাকাল্টি পাওয়া যায়নি" };
  }

  return {
    title: `${data.name}`,
    description: `${data.name} — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় (SAU)-এর এই ফ্যাকাল্টির সব বিভাগ ও সদস্যদের তালিকা দেখুন। SAU Alumni Network-এ সংযুক্ত হোন।`,
    alternates: {
      canonical: `https://sau-alumni.vercel.app/faculty/${slug}`,
    },
  };
}

export default async function FacultyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("faculties")
    .select("id, name, slug, code")
    .eq("slug", slug)
    .maybeSingle();

  const faculty = data as FacultyData | null;
  if (!faculty) {
    notFound();
  }

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, slug")
    .eq("faculty_id", faculty.id)
    .order("name");

  // Prottek department-e koto public member
  const deptList = await Promise.all(
    (departments ?? []).map(async (d) => {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("department_id", d.id)
        .eq("is_public", true)
        .is("deleted_at", null);
      return { ...d, count: count ?? 0 };
    })
  );

  const totalMembers = deptList.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AnimatedSection>
        <Link
          href="/directory"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 transition-colors hover:text-sau dark:hover:text-emerald-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          ডিরেক্টরিতে ফিরুন
        </Link>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{faculty.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-ink/50">
          <Users className="h-4 w-4" />
          ফ্যাকাল্টি · মোট সদস্য: {totalMembers} জন
        </p>
      </AnimatedSection>

      {deptList.length === 0 ? (
        <AnimatedSection delay={0.2}>
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-10 text-center">
            <Users className="h-10 w-10 text-ink/20" />
            <p className="text-ink/60">
              এই ফ্যাকাল্টিতে এখনো কোনো বিভাগ যোগ করা হয়নি।
            </p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="mt-8 space-y-4">
          {deptList.map((d, i) => (
            <AnimatedSection key={d.id} delay={Math.min(i * 0.08, 0.4)}>
              <div className="glass-card flex items-center justify-between gap-4 rounded-2xl p-5">
                <div>
                  <h2 className="font-semibold">{d.name}</h2>
                  <p className="mt-0.5 text-sm text-ink/50">{d.count} জন সদস্য</p>
                </div>
                <Link
                  href={`/directory?faculty=${faculty.id}`}
                  className="group flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium transition-all hover:border-sau/30 hover:bg-sau/5 hover:text-sau"
                >
                  সদস্য দেখুন
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}