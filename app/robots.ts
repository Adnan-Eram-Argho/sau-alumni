import type { MetadataRoute } from "next";

// Search bot-der jonno niyemala — kothay jete parbe na
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Ei gulo Google-e index hobe na (spec: admin/dashboard)
      // /auth o — login/signup page index-er dorkar nei
      disallow: ["/admin", "/dashboard", "/auth"],
    },
    sitemap: "https://sau-alumni.vercel.app/sitemap.xml",
  };
}