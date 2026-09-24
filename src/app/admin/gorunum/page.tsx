import Link from "next/link";
import CollectionBannerEditor from "@/components/admin/CollectionBannerEditor";
import HeroBannerEditor from "@/components/admin/HeroBannerEditor";
import { isBlobConfigured } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { CURATED_DEFAULTS, CURATED_SLUGS, getCuratedTitle } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminAppearancePage() {
  const [banner, overrides] = await Promise.all([
    prisma.banner.findFirst({ where: { active: true }, orderBy: { position: "asc" } }),
    prisma.collectionBanner.findMany({ where: { slug: { in: CURATED_SLUGS } } }),
  ]);
  const uploadEnabled = isBlobConfigured();

  return (
    <div className="mx-auto max-w-container-max">
      <header className="mb-stack-sm">
        <h1 className="mb-2 font-display-lg text-headline-md text-on-surface">Görünüm</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Ana sayfa bannerı ve koleksiyonlar sayfasındaki seçki bannerları. Kategori görselleri{" "}
          <Link href="/admin/kategoriler" className="text-primary underline">
            Kategoriler
          </Link>{" "}
          sayfasından değiştirilir.
        </p>
      </header>

      <HeroBannerEditor
        uploadEnabled={uploadEnabled}
        initial={{
          subtitle: banner?.subtitle ?? "",
          title: banner?.title ?? "",
          description: banner?.description ?? "",
          image: banner?.image ?? "",
          buttonText: banner?.buttonText ?? "Koleksiyonu Keşfet",
          link: banner?.link ?? "/koleksiyonlar",
        }}
      />

      <h2 className="mb-1 font-headline-sm text-headline-sm text-on-surface">Seçki Bannerları</h2>
      <p className="mb-6 font-body-sm text-body-sm text-on-surface-variant">
        Koleksiyonlar sayfasındaki Yeni Gelenler, Çok Satanlar ve İndirim kartları. Boş bırakılan
        alanlarda varsayılan metin ve otomatik ürün görseli kullanılır.
      </p>
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {CURATED_DEFAULTS.map((meta) => {
          const custom = overrides.find((o) => o.slug === meta.slug);
          return (
            <CollectionBannerEditor
              key={meta.slug}
              slug={meta.slug}
              title={getCuratedTitle(meta.slug) ?? meta.slug}
              defaults={{ eyebrow: meta.eyebrow, tagline: meta.tagline }}
              uploadEnabled={uploadEnabled}
              initial={{
                eyebrow: custom?.eyebrow ?? "",
                tagline: custom?.tagline ?? "",
                image: custom?.image ?? "",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
