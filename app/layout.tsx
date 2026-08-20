import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { WeddingMusicPlayer } from "@/component/WeddingMusicPlayer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: {
    default: "Yasmim & Vitor • 20/06/2027",
    template: "%s • Yasmim & Vitor",
  },
  description:
    "Site do casamento de Yasmim e Vitor — informações do evento, dress code, fotos e Pix.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${greatVibes.variable} antialiased`}
      >
        <WeddingMusicPlayer />
        {children}
      </body>
    </html>
  );
}
