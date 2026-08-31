import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // İşlem ve hesap sayfaları dizine eklenmemeli
      disallow: [
        "/admin",
        "/api",
        "/hesabim",
        "/sepet",
        "/odeme",
        "/siparis",
        "/giris",
        "/kayit",
        "/sifremi-unuttum",
        "/sifre-sifirla",
        "/arama",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
