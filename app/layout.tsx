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
    "Sher-e-Bangla Agricultural University-er alumni ar current student-der network — khunje nin shob batch-mate, desh-bidesh.",
  icons: {
    apple: "/icons/apple-touch-icon.png",
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