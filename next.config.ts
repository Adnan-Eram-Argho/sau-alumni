import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),

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
              "img-src 'self' data:",
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

// PWA — service worker (build er somoy public/sw.js banay)
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // dev-e off — shudhu production-e cholbe
  disable: isDev,
});

export default withSerwist(nextConfig);