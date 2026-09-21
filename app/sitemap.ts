import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://sau-alumni.vercel.app";

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1, lastModified: new Date() },
    { url: `${base}/directory`, changeFrequency: "daily", priority: 0.9, lastModified: new Date() },
    { url: `${base}/notices`, changeFrequency: "daily", priority: 0.7, lastModified: new Date() },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5, lastModified: new Date("2025-01-01") },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2025-01-01") },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3, lastModified: new Date("2025-01-01") },
  ];

  const supabase = await createClient();

  // Faculty pages
  const { data: faculties } = await supabase
    .from("faculties")
    .select("slug, created_at");
  (faculties ?? []).forEach((f) => {
    entries.push({
      url: `${base}/faculty/${f.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
      lastModified: f.created_at ? new Date(f.created_at) : new Date(),
    });
  });

  // Published notices — lastModified = publish_at ba created_at
  const { data: notices } = await supabase
    .from("notices")
    .select("slug, publish_at, created_at")
    .eq("status", "published");
  (notices ?? []).forEach((n) => {
    entries.push({
      url: `${base}/notices/${n.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
      lastModified: n.publish_at
        ? new Date(n.publish_at)
        : n.created_at
          ? new Date(n.created_at)
          : new Date(),
    });
  });

  // Profile pages — SHUDHU public gulai (privacy-first, spec)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, created_at")
    .eq("is_public", true)
    .is("deleted_at", null);
  (profiles ?? []).forEach((p) => {
    entries.push({
      url: `${base}/alumni/${p.id}`,
      changeFrequency: "monthly",
      priority: 0.4,
      lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    });
  });

  return entries;
}