import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

// Bangla + English dutoi sundor dekhay. Build er somoy Google
// Fonts theke download hoy nijer server-e boshe jay
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SAU Alumni",
  description: "Sher-e-Bangla Agricultural University Alumni Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={`${hindSiliguri.variable} antialiased`}>
        <Header />
        {children}
      </body>
    </html>
  );
}