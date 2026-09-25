import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { createClient } from "@/utils/supabase/server";
import MarkNoticeRead from "@/components/MarkNoticeRead";
import AnimatedSection from "@/components/AnimatedSection";
import { Pin, Eye, ArrowLeft } from "lucide-react";

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

// React cache() — generateMetadata ar NoticeDetailPage ek-e request-e ekbar-i DB call kore
const getNotice = cache(async (slug: string) => {
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

  return data as NoticeData | null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getNotice(slug);

  if (!data || data.status !== "published") {
    return { title: "নোটিশ পাওয়া যায়নি" };
  }

  const description =
    (data.content ?? "")
      .replace(/[#*`[\]]/g, " ")
      .slice(0, 155)
      .trim() || `${data.title} — SAU Alumni Network নোটিশ।`;

  return {
    title: `${data.title}`,
    description,
    alternates: {
      canonical: `https://sau-alumni.vercel.app/notices/${slug}`,
    },
    openGraph: {
      title: `${data.title} — SAU Alumni`,
      description,
      type: "article",
      url: `https://sau-alumni.vercel.app/notices/${slug}`,
      ...(data.image_url
        ? { images: [{ url: data.image_url, alt: data.title }] }
        : {}),
    },
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const notice = await getNotice(slug);

  if (!notice) {
    notFound();
  }

  const isPreview = notice.status !== "published";

  // Article JSON-LD — Google ke bolche ei ekta article/notice
  const articleLd = !isPreview
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: notice.title,
        datePublished: notice.publish_at ?? notice.created_at,
        ...(notice.image_url ? { image: notice.image_url } : {}),
        author: {
          "@type": "Person",
          name: notice.profiles?.full_name ?? "SAU Alumni",
        },
        publisher: {
          "@type": "Organization",
          name: "SAU Alumni Network",
          logo: {
            "@type": "ImageObject",
            url: "https://sau-alumni.vercel.app/icons/icon-512.png",
          },
        },
      }
    : null;

  // Breadcrumb — Google search e "SAU Alumni > নোটিশ > Title" dekhabe
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
        name: "নোটিশ বোর্ড",
        item: "https://sau-alumni.vercel.app/notices",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: notice.title,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Pora hoye gelo — mark (khali published hole) */}
      {!isPreview && <MarkNoticeRead noticeId={notice.id} />}

      {/* Structured Data — Article + Breadcrumb */}
      {articleLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <AnimatedSection>
        <Link
          href="/notices"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 transition-colors hover:text-sau dark:hover:text-emerald-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          নোটিশ বোর্ডে ফিরুন
        </Link>
      </AnimatedSection>

      {isPreview && (
        <AnimatedSection delay={0.1}>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/60 bg-amber-100/60 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
            <Eye className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              খসড়া-প্রিভিউ — শুধু তুমি (লেখক) দেখতে পাচ্ছো। Admin প্রকাশ করলে
              সবাই দেখবে।
            </p>
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.15}>
        <article className="mt-6">
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold sm:text-3xl">
            <span>{notice.title}</span>
            {notice.pinned && (
              <Pin className="h-5 w-5 text-amber-500" />
            )}
          </h1>

          <p className="mt-2 text-xs text-ink/45">
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
              className="mt-6 w-full rounded-2xl border border-line shadow-sm"
            />
          )}

          <div className="mt-6 space-y-3 text-ink/85 [&_a]:text-sau dark:[&_a]:text-emerald-300 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-base [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:border-line [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-base [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {notice.content}
            </ReactMarkdown>
          </div>
        </article>
      </AnimatedSection>
    </div>
  );
}