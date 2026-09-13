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
  title: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
  description:
    "Connect with alumni and current students of Sher-e-Bangla Agricultural University (SAU), Dhaka. Search by name, batch, department, or country — find your batchmates across the world.",
  keywords: [
    "SAU",
    "Sher-e-Bangla Agricultural University",
    "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
    "alumni",
    "alumni network",
    "Dhaka",
    "Bangladesh",
    "agricultural university",
    "batchmate",
    "directory",
  ],
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
    title: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
    description:
      "Connect with alumni and current students of Sher-e-Bangla Agricultural University. Search by name, batch, department, or country.",
    siteName: "SAU Alumni Network",
    type: "website",
    locale: "bn_BD",
    url: "https://sau-alumni.vercel.app",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "SAU Alumni Network",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SAU Alumni — শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়",
    description:
      "Connect with alumni and current students of Sher-e-Bangla Agricultural University. Find your batchmates across the world.",
    images: ["/icons/icon-512.png"],
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