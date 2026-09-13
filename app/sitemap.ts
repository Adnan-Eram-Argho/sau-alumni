import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sau-alumni.vercel.app";

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/directory`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/notices`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
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

  // Published notices
  const { data: notices } = await supabase
    .from("notices")
    .select("slug")
    .eq("status", "published");
  (notices ?? []).forEach((n) => {
    entries.push({
      url: `${base}/notices/${n.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  });

  // Profile pages — SHUDHU public gulai (privacy-first, spec)
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