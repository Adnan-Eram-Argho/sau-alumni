import type { MetadataRoute } from "next";

// App install-er somoy phone ei porichoy dekhay
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SAU Alumni Network",
    short_name: "SAU Alumni",
    description:
      "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও বর্তমান শিক্ষার্থীদের নেটওয়ার্ক",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ea",
    theme_color: "#1e5c3a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}