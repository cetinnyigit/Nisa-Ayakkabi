import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Geçici görseller — gerçek ürün fotoğrafları Vercel Blob'a yüklenince değişecek. */
const img = {
  sneakerWhite: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1000",
  sneakerSuede: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=1000",
  sneakerPlatform: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1000",
  // Not: eski photo-1512374382149 Unsplash'ten kaldırıldı (404) — değiştirildi.
  sneakerSport: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000",
  catSneaker: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000",
  catTerlik: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&q=80&w=1000",
  catBabet: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1000",
  catBot: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&q=80&w=1000",
  // Ana sayfa hero'su: kadın ayağında topuklu, editoryal çekim (Vlad Deep / Unsplash).
  // Geniş ekranı doldurduğu için diğerlerinden yüksek çözünürlük ve kalitede.
  hero: "https://images.unsplash.com/photo-1659261448687-6d01466e06e4?auto=format&fit=crop&q=85&w=2400",
};

const categories = [
  { name: "Sneaker", nameEn: "Sneakers", slug: "sneaker", image: img.catSneaker, showInNav: true, navPosition: 1, showOnHome: true, homePosition: 1 },
  { name: "Babet", nameEn: "Flats", slug: "babet", image: img.catBabet, showInNav: true, navPosition: 2, showOnHome: true, homePosition: 2 },
  { name: "Bot", nameEn: "Boots", slug: "bot", image: img.catBot, showInNav: true, navPosition: 3, showOnHome: true, homePosition: 3 },
  { name: "Terlik", nameEn: "Slippers", slug: "terlik", image: img.catTerlik, showInNav: true, navPosition: 4, showOnHome: true, homePosition: 4 },
  { name: "Topuklu", nameEn: "Heels", slug: "topuklu", image: img.catBabet, showInNav: false, navPosition: 5, showOnHome: false, homePosition: 5 },
  { name: "Sandalet", nameEn: "Sandals", slug: "sandalet", image: img.catTerlik, showInNav: false, navPosition: 6, showOnHome: false, homePosition: 6 },
];

type SeedProduct = {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  price: number;
  comparePrice?: number;
  categorySlug: string;
  image: string;
  material: string;
  materialEn: string;
  heelHeight?: number;
  season: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
};

const products: SeedProduct[] = [
  {
    name: "Klasik Beyaz Sneaker", nameEn: "Classic White Sneaker", slug: "klasik-beyaz-sneaker",
    description: "Hakiki dana derisinden el işçiliğiyle üretilen zamansız beyaz sneaker. Ortopedik iç taban ve esnek kauçuk dış taban ile gün boyu konfor.",
    descriptionEn: "A timeless white sneaker handcrafted from genuine calfskin. Orthopedic insole and flexible rubber outsole for all-day comfort.",
    price: 2850, categorySlug: "sneaker", image: img.sneakerWhite,
    material: "Hakiki deri", materialEn: "Genuine leather", season: "4mevsim",
    featured: true, bestSeller: true,
  },
  {
    name: "Süet Detaylı Sneaker", nameEn: "Suede Detail Sneaker", slug: "suet-detayli-sneaker",
    description: "Süet ve deri kombinasyonuyla tasarlanmış, günlük kombinlerinizi tamamlayacak modern bir tasarım.",
    descriptionEn: "A modern design combining suede and leather to complete your everyday looks.",
    price: 3100, comparePrice: 3600, categorySlug: "sneaker", image: img.sneakerSuede,
    material: "Süet & deri", materialEn: "Suede & leather", season: "4mevsim",
    bestSeller: true,
  },
  {
    name: "Deri Platform Sneaker", nameEn: "Leather Platform Sneaker", slug: "deri-platform-sneaker",
    description: "4 cm platform tabanı ile boy uzatan, hakiki deri üst yapılı sneaker.",
    descriptionEn: "Height-enhancing sneaker with a 4 cm platform sole and genuine leather upper.",
    price: 3450, categorySlug: "sneaker", image: img.sneakerPlatform,
    material: "Hakiki deri", materialEn: "Genuine leather", heelHeight: 4, season: "4mevsim",
    newArrival: true,
  },
  {
    name: "Modern Sport Sneaker", nameEn: "Modern Sport Sneaker", slug: "modern-sport-sneaker",
    description: "Hafif yapısı ve nefes alan astarı ile uzun yürüyüşler için ideal.",
    descriptionEn: "Lightweight construction and breathable lining make it ideal for long walks.",
    price: 2950, categorySlug: "sneaker", image: img.sneakerSport,
    material: "Tekstil & deri", materialEn: "Textile & leather", season: "yaz",
    newArrival: true,
  },
  {
    name: "Deri Babet", nameEn: "Leather Flat", slug: "deri-babet",
    description: "Yumuşak keçi derisinden üretilen, katlanabilir esnek tabanlı klasik babet.",
    descriptionEn: "Classic flat made from soft goatskin with a foldable flexible sole.",
    price: 2150, categorySlug: "babet", image: img.catBabet,
    material: "Keçi derisi", materialEn: "Goatskin", season: "4mevsim",
    featured: true, bestSeller: true,
  },
  {
    name: "Sivri Burun Süet Babet", nameEn: "Pointed Suede Flat", slug: "sivri-burun-suet-babet",
    description: "Sivri burun kalıbı ile bacakları uzun gösteren, ofis kombinleri için ideal süet babet.",
    descriptionEn: "Pointed-toe suede flat that elongates the leg — ideal for office looks.",
    price: 2350, categorySlug: "babet", image: img.catBabet,
    material: "Süet", materialEn: "Suede", season: "4mevsim",
  },
  {
    name: "Süet Bot", nameEn: "Suede Boot", slug: "suet-bot",
    description: "Yün astarlı, su itici süet bot. Kaydırmaz taban ile kış aylarında güvenli adımlar.",
    descriptionEn: "Wool-lined, water-repellent suede boot. Non-slip sole for confident winter steps.",
    price: 4200, comparePrice: 4900, categorySlug: "bot", image: img.catBot,
    material: "Süet", materialEn: "Suede", heelHeight: 3.5, season: "kis",
    featured: true, bestSeller: true,
  },
  {
    name: "Deri Bilekli Bot", nameEn: "Leather Ankle Boot", slug: "deri-bilekli-bot",
    description: "Yan fermuarlı, hakiki deri bilek botu. Blok topuk ile gün boyu denge.",
    descriptionEn: "Side-zip genuine leather ankle boot. Block heel for all-day balance.",
    price: 3890, categorySlug: "bot", image: img.catBot,
    material: "Hakiki deri", materialEn: "Genuine leather", heelHeight: 5, season: "kis",
  },
  {
    name: "Deri Ev Terliği", nameEn: "Leather Slipper", slug: "deri-ev-terligi",
    description: "Anatomik mantar tabanlı, hakiki deri bantlı terlik.",
    descriptionEn: "Genuine leather strap slipper with an anatomical cork footbed.",
    price: 1450, categorySlug: "terlik", image: img.catTerlik,
    material: "Hakiki deri", materialEn: "Genuine leather", season: "yaz",
  },
  {
    name: "Çift Bantlı Terlik", nameEn: "Double Strap Slipper", slug: "cift-bantli-terlik",
    description: "Ayarlanabilir çift bant ile her ayak yapısına uyum sağlayan yazlık terlik.",
    descriptionEn: "Summer slipper with adjustable double straps that fit every foot shape.",
    price: 1650, categorySlug: "terlik", image: img.catTerlik,
    material: "Hakiki deri", materialEn: "Genuine leather", season: "yaz",
    newArrival: true,
  },
  {
    name: "Klasik Topuklu", nameEn: "Classic Pump", slug: "klasik-topuklu",
    description: "7 cm stiletto topuk, deri astar ve yastıklı iç taban ile özel günlerin klasiği.",
    descriptionEn: "A special-occasion classic with a 7 cm stiletto heel, leather lining and cushioned insole.",
    price: 3450, categorySlug: "topuklu", image: img.catBabet,
    material: "Rugan deri", materialEn: "Patent leather", heelHeight: 7, season: "4mevsim",
    featured: true, bestSeller: true,
  },
  {
    name: "İpli Sandalet", nameEn: "Strappy Sandal", slug: "ipli-sandalet",
    description: "Bilekten bağlamalı ince deri kayışlar ve 4 cm dolgu topuk.",
    descriptionEn: "Ankle-tie thin leather straps with a 4 cm wedge heel.",
    price: 2450, categorySlug: "sandalet", image: img.catTerlik,
    material: "Hakiki deri", materialEn: "Genuine leather", heelHeight: 4, season: "yaz",
    bestSeller: true,
  },
];

const colorways = [
  { color: "Siyah", colorHex: "#1a1c1a" },
  { color: "Vizon", colorHex: "#bea38f" },
  { color: "Krem", colorHex: "#faf9f6" },
];

const sizes = ["36", "37", "38", "39", "40"];

async function main() {
  console.log("Seed başlıyor...");

  // Sıfırdan tutarlı bir durum için ilişkili tabloları temizle
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.banner.deleteMany();

  const brand = await prisma.brand.create({
    data: { name: "Nisa Atelier", slug: "nisa-atelier" },
  });

  const categoryBySlug = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.category.create({
      data: {
        ...c,
        description: `${c.name} koleksiyonu — el işçiliği, sınırlı üretim.`,
        descriptionEn: `${c.nameEn} collection — handcrafted, limited production.`,
        colSpan: "md:col-span-3",
      },
    });
    categoryBySlug.set(c.slug, created.id);
  }
  console.log(`${categories.length} kategori eklendi.`);

  let variantCount = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const categoryId = categoryBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Kategori bulunamadı: ${p.categorySlug}`);

    // Her ürüne 2 renk × 5 numara = 10 varyant
    const productColorways = colorways.slice(0, 2);
    const variants = productColorways.flatMap((cw) =>
      sizes.map((size) => ({
        size,
        color: cw.color,
        colorHex: cw.colorHex,
        stock: size === "36" || size === "40" ? 2 : 8,
      }))
    );

    await prisma.product.create({
      data: {
        name: p.name,
        nameEn: p.nameEn,
        slug: p.slug,
        description: p.description,
        descriptionEn: p.descriptionEn,
        price: p.price,
        comparePrice: p.comparePrice,
        sku: `NSA-${String(i + 1).padStart(4, "0")}`,
        stock: variants.reduce((sum, v) => sum + v.stock, 0),
        featured: p.featured ?? false,
        bestSeller: p.bestSeller ?? false,
        newArrival: p.newArrival ?? false,
        categoryId,
        brandId: brand.id,
        material: p.material,
        materialEn: p.materialEn,
        soleMaterial: "Kauçuk",
        heelHeight: p.heelHeight,
        gender: "kadin",
        season: p.season,
        images: {
          create: [{ url: p.image, alt: p.name, position: 0 }],
        },
        variants: { create: variants },
      },
    });
    variantCount += variants.length;
  }
  console.log(`${products.length} ürün, ${variantCount} varyant eklendi.`);

  // `??` kullanılmamalı: .env'de SEED_ADMIN_PASSWORD="" boş string olarak gelir
  // ve `??` boş string'i geçerli sayıp boş şifre hash'ler.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  await prisma.user.upsert({
    where: { email: "admin@nisaayakkabi.com" },
    update: { role: "ADMIN", password: await bcrypt.hash(adminPassword, 10) },
    create: {
      email: "admin@nisaayakkabi.com",
      name: "Nisa Admin",
      password: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });
  console.log("Admin kullanıcısı hazır: admin@nisaayakkabi.com");

  await prisma.banner.create({
    data: {
      title: "El İşçiliği Modern Zarafetle Buluşuyor.",
      titleEn: "Where Craftsmanship Meets Modern Elegance.",
      subtitle: "Sonbahar Seçkisi",
      subtitleEn: "Autumn Selection",
      description:
        "Zevk sahibi bireyler için tasarlanmış el yapımı ayakkabı ve aksesuar koleksiyonumuzu keşfedin.",
      descriptionEn:
        "Discover our handcrafted collection of shoes and accessories designed for the discerning.",
      image: img.hero,
      link: "/koleksiyonlar",
      buttonText: "Koleksiyonu Keşfet",
      buttonTextEn: "Explore the Collection",
      position: 0,
    },
  });

  console.log("Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
