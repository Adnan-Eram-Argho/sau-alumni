import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";

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

  return {
    title: data
      ? `${data.name} — SAU Alumni`
      : "ফ্যাকাল্টি পাওয়া যায়নি — SAU Alumni",
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
      <Link
        href="/directory"
        className="text-sm font-medium text-ink/60 hover:text-ink"
      >
        ← ডিরেক্টরিতে ফিরুন
      </Link>

      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{faculty.name}</h1>
      <p className="mt-1 text-ink/60">ফ্যাকাল্টি · মোট সদস্য: {totalMembers} জন</p>

      {deptList.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-center text-ink/70">
          এই ফ্যাকাল্টিতে এখনো কোনো বিভাগ যোগ করা হয়নি।
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {deptList.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm"
            >
              <div>
                <h2 className="font-semibold">{d.name}</h2>
                <p className="mt-0.5 text-sm text-ink/60">{d.count} জন সদস্য</p>
              </div>
              <Link
                href={`/directory?faculty=${faculty.id}`}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-base"
              >
                সদস্য দেখুন →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}