import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

// Supabase-r host — public chobi er URL ekhan theke (env theke,
// kono kichhu hardcode na)
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),

  // Supabase Storage-r chobi next/image-e load korar jonno
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https" as const, hostname: supabaseHost }]
      : [],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Supabase Storage-r public chobi
              "img-src 'self' data: blob:" +
                (supabaseHost ? ` https://${supabaseHost}` : ""),
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com" + (isDev ? " 'unsafe-eval' blob:" : " blob:"),
              "style-src 'self' 'unsafe-inline'",
              "worker-src 'self' blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel-insights.com https://va.vercel-scripts.com" +
                (isDev ? " ws://localhost:3000" : ""),
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
});

export default withSerwist(nextConfig);