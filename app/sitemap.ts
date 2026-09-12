import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

// Google-er jonno "amar site-e ei ei page ache" — list
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sau-alumni.vercel.app";

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/directory`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const supabase = await createClient();

  // Faculty pages
  const { data: faculties } = await supabase
    .from("faculties")
    .select("slug");
  (faculties ?? []).forEach((f) => {
    entries.push({
      url: `${base}/faculty/${f.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  // Profile pages — SHUDHU public gulai (privacy-first, spec Section 6)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_public", true)
    .is("deleted_at", null);
  (profiles ?? []).forEach((p) => {
    entries.push({
      url: `${base}/alumni/${p.id}`,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  });

  return entries;
}