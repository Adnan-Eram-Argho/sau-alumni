import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "নোটিশ বোর্ড — SAU Alumni",
  description:
    "Sher-e-Bangla Agricultural University Alumni Network-er sob dekha-shona — event, update, announcement.",
};

export default async function NoticesPage() {
  const supabase = await createClient();

  // Published notices — pin age, tar date onujayi
  // (embed-e fkey-hint: notices-profiles/faculties/der
  // ekadhik path ache — bole dewa safe)
  const { data } = await supabase
    .from("notices")
    .select(
      `id, title, slug, pinned, publish_at, created_at, image_url,
       faculties!notices_faculty_id_fkey(name),
       departments!notices_department_id_fkey(name),
       profiles!notices_author_id_fkey(full_name)`
    )
    .eq("status", "published")
    .order("pinned", { ascending: false })
    .order("publish_at", { ascending: false, nullsFirst: false })
    .limit(30);

  const notices = (data ?? []) as unknown as {
    id: string;
    title: string;
    slug: string;
    pinned: boolean | null;
    publish_at: string | null;
    created_at: string | null;
    image_url: string | null;
    faculties: { name: string } | null;
    departments: { name: string } | null;
    profiles: { full_name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">নোটিশ বোর্ড</h1>
      <p className="mt-1 text-ink/60">সব আপডেট, ঘোষণা, ইভেন্ট — এক জায়গায়।</p>

      {notices.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-center text-ink/70">
          এখনো কোনো নোটিশ প্রকাশিত হয়নি।
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {notices.map((n) => (
            <Link
              key={n.id}
              href={`/notices/${n.slug}`}
              className="block rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                <span className="truncate">{n.title}</span>
                {n.pinned && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                    📌 পিন
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-ink/50">
                {n.profiles?.full_name ?? "SAU"} ·{" "}
                {(n.publish_at ?? n.created_at)?.slice(0, 10)}
                {n.departments?.name
                  ? ` · ${n.departments.name}`
                  : n.faculties?.name
                    ? ` · ${n.faculties.name}`
                    : ""}
              </p>
              {n.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={n.image_url}
                  alt=""
                  className="mt-3 max-h-36 rounded-xl border border-line object-cover"
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}