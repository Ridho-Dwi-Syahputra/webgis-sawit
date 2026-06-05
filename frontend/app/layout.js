import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavSidebar from "@/components/NavSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "WebGIS Sawit — Kelompok 8",
  description:
    "Visualisasi peta perkebunan kelapa sawit Palangka Raya (Tugas Analisis Spasial, Kelompok 8).",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full overflow-hidden">
        <NavSidebar />
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
