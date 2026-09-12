import type { NextConfig } from "next";
import path from "path";

// dev mode-e kichhu extra relaxation lage (CSP-te dekhbe)
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Fix: D:\projects folder-e ekta stray package-lock.json ache,
  // tai Next.js confuse hoto konta ashol project root.
  // Eta diye sposto bole dicchi — project root ei folder.
  outputFileTracingRoot: path.join(__dirname),

  // Security headers — spec Section 4, Step 1 thekei lage
  async headers() {
    return [
      {
        source: "/(.*)", // shob page-e apply hobe
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
              "img-src 'self' data:", // Step 6-e R2-er domain ekhane add korbo
              "script-src 'self' 'unsafe-inline'" + (isDev ? " 'unsafe-eval'" : ""),
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co" +
                (isDev ? " ws://localhost:3000" : ""),
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;