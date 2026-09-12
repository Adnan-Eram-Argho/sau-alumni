import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { createClient } from "@/utils/supabase/server";

type NoticeData = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  status: string;
  pinned: boolean | null;
  publish_at: string | null;
  created_at: string | null;
  faculties: { name: string } | null;
  departments: { name: string } | null;
  profiles: { full_name: string } | null;
};

// Prottek notice-r nijasro title/description (SEO)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("notices")
    .select("title, content, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!data || data.status !== "published") {
    return { title: "নোটিশ পাওয়া যায়নি — SAU Alumni" };
  }

  const description =
    (data.content ?? "").replace(/[#*`[\]]/g, " ").slice(0, 150).trim() ||
    "SAU Alumni notice.";

  return {
    title: `${data.title} — SAU Alumni`,
    description,
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("notices")
    .select(
      `id, title, content, image_url, status, pinned, publish_at, created_at,
       faculties!notices_faculty_id_fkey(name),
       departments!notices_department_id_fkey(name),
       profiles!notices_author_id_fkey(full_name)`
    )
    .eq("slug", slug)
    .maybeSingle();

  const notice = data as NoticeData | null;

  // RLS: shudhu published (ba nijer row) ashe — na thakle 404
  if (!notice) {
    notFound();
  }

  const isPreview = notice.status !== "published";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/notices"
        className="text-sm font-medium text-ink/60 hover:text-ink"
      >
        ← নোটিশ বোর্ডে ফিরুন
      </Link>

      {isPreview && (
        <p className="mt-4 rounded-xl border border-amber-300/60 bg-amber-100/60 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
          👀 খসড়া-প্রিভিউ — শুধু তুমি (লেখক) দেখতে পাচ্ছো। Admin প্রকাশ করলে
          সবাই দেখবে।
        </p>
      )}

      <article className="mt-6">
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold sm:text-3xl">
          <span>{notice.title}</span>
          {notice.pinned && <span title="Pinned">📌</span>}
        </h1>

        <p className="mt-2 text-xs text-ink/50">
          {notice.profiles?.full_name ?? "SAU"} ·{" "}
          {(notice.publish_at ?? notice.created_at)?.slice(0, 10)}
          {notice.departments?.name
            ? ` · ${notice.departments.name}`
            : notice.faculties?.name
              ? ` · ${notice.faculties.name}`
              : ""}
        </p>

        {notice.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notice.image_url}
            alt={notice.title}
            className="mt-6 w-full rounded-2xl border border-line"
          />
        )}

        {/* Markdown — sanitizer diye render (raw HTML jay na) */}
        <div className="mt-6 space-y-3 text-ink/85 [&_a]:text-sau dark:[&_a]:text-emerald-300 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-base [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:border-line [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-base [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
            {notice.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}