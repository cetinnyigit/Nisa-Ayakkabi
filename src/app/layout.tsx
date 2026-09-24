import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import SessionProvider from "@/components/auth/SessionProvider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nisa Ayakkabı",
    template: "%s | Nisa Ayakkabı",
  },
  description:
    "Yeni sezon kadın ayakkabı modellerini keşfedin. Bot, çizme ve sandalet çeşitleri şıklık ve konforu bir arada. Online alışverişe özel fırsatlar Nisa Ayakkabı'da.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        {/* Material Symbols. next/font ile alınamıyor (değişken eksenli ikon fontu),
            CSS @import'u ise webpack çıktısında güvenilir şekilde uygulanmıyordu.
            eslint kuralı pages/_document içindir; App Router'da bu doğru yöntem. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="selection:bg-primary-fixed selection:text-on-primary-fixed">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
