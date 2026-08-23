import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Semakin Pede — Komunitas Trader Futures Gold, Oil, CPO Indonesia",
  description:
    "Semakin Pede: Komunitas trader futures Indonesia. Belajar trading Gold, Oil, CPO bareng mentor BAPPEBTI. Edukasi gratis, diskusi market, komunitas aktif 5.000+ trader.",
  keywords: [
    "komunitas trading",
    "komunitas futures",
    "semakin pede",
    "trader indonesia",
    "belajar trading gold",
    "trading oil",
    "CPO trading",
    "BAPPEBTI",
    "komunitas trader komoditas",
    "grup trading gratis",
  ],
  openGraph: {
    title: "Semakin Pede — Komunitas Trader Futures Indonesia",
    description:
      "Komunitas trader futures Indonesia. Belajar bareng mentor BAPPEBTI. Edukasi gratis, 5.000+ trader aktif.",
    siteName: "Semakin Pede",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plusJakarta.variable} h-full`}
    >
      <body className="min-h-full bg-white text-navy-900 font-[var(--font-body)] antialiased">
        {children}
      </body>
    </html>
  );
}
