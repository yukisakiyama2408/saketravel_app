import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import TabBarWrapper from "@/components/TabBarWrapper";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sakemap",
  description: "一杯で、世界を旅する。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSerifJP.variable} ${notoSansJP.variable} ${jetBrainsMono.variable} h-dvh overflow-hidden antialiased`}
    >
      <body className="h-full">
        <AuthProvider>
          {children}
          <TabBarWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
