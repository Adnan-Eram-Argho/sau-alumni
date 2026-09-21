import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MadeByBadge from "@/components/MadeByBadge";
import SmoothScroll from "@/components/SmoothScroll";
import { Analytics } from "@vercel/analytics/next";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sau-alumni.vercel.app"),
  title: {
    default: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় এলামনাই নেটওয়ার্ক",
    template: "%s — SAU Alumni",
  },
  description:
    "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় (SAU)-র প্রাক্তন ও বর্তমান শিক্ষার্থীদের ডিরেক্টরি। নাম, ব্যাচ, বিভাগ বা দেশ দিয়ে সার্চ করে খুঁজে নাও তোমার ব্যাচমেটদের। Connect with SAU alumni and students worldwide.",
  keywords: [
    "SAU",
    "SAU alumni",
    "Sher-e-Bangla Agricultural University",
    "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
    "শেকৃবি",
    "SAU ডিরেক্টরি",
    "SAU alumni directory",
    "কৃষি বিশ্ববিদ্যালয় alumni",
    "SAU batchmate",
    "SAU alumni network",
    "alumni",
    "alumni network",
    "Dhaka",
    "Bangladesh",
    "agricultural university",
    "batchmate",
    "directory",
    "শেরে-বাংলা নগর",
    "SAU Dhaka",
    "কৃষি বিশ্ববিদ্যালয়",
  ],
  category: "education",
  alternates: {
    canonical: "https://sau-alumni.vercel.app",
  },
  authors: [{ name: "Adnan Eram Argho" }],
  creator: "Adnan Eram Argho",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় এলামনাই নেটওয়ার্ক",
    description:
      "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় (SAU)-র প্রাক্তন ও বর্তমান শিক্ষার্থীদের ডিরেক্টরি ও নেটওয়ার্ক। নাম, ব্যাচ, বিভাগ বা দেশ দিয়ে সার্চ করে ব্যাচমেটদের খুঁজে নাও।",
    siteName: "SAU Alumni Network",
    type: "website",
    locale: "bn_BD",
    url: "https://sau-alumni.vercel.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SAU Alumni Network — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয় এলামনাই নেটওয়ার্ক",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
    description:
      "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও বর্তমান শিক্ষার্থীদের নেটওয়ার্ক। সারা পৃথিবীতে ব্যাচমেটদের খুঁজে নাও।",
    images: ["/og-image.png"],
  },
  verification: {
    google: "DkJs8EUim9VsvxeFGZcqVDGc-1k9hApjEqNAuFsapyw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${hindSiliguri.variable} flex min-h-screen flex-col bg-base text-ink antialiased bg-grain`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
        <SmoothScroll>
          <Header />
          <div className="relative z-[1] flex-1">{children}</div>
          <Footer />
        </SmoothScroll>
        <MadeByBadge />
        <Analytics />
      </body>
    </html>
  );
}