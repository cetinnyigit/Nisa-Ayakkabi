/**
 * Markalı (Nike/Puma/Birkenstock) ve içeriği ürünle uyuşmayan dummy görselleri
 * markasız ayakkabı görselleriyle değiştirir.
 *
 * Yeniden seed etmek yerine slug bazlı hedefli güncelleme yapar — seed.ts
 * siparişleri ve ürünleri siliyor, canlı veride kullanılamaz.
 *
 * Çalıştırma:
 *   DATABASE_URL="..." node fix-images.js          (önizleme)
 *   DATABASE_URL="..." node fix-images.js --uygula (yazar)
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const U = (id, w = 1000, q = 80) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=${q}&w=${w}`;

// Hepsi tek tek açılıp logo içermediği gözle doğrulandı.
const img = {
  sneakerWhite: U("1608384177866-0bca0d225435"),
  sneakerPlatform: U("1672920800748-a5fb6dfd0c2b"),
  sneakerSport: U("1531851378526-c7c8eb5cb43f"),
  catSneaker: U("1502830778456-7c68e5a3c5f2"),
  babet: U("1758542988664-49951c5b1999"),
  botSuet: U("1621996659490-3275b4d0d951"),
  botDeri: U("1605732440685-d0654d81aa30"),
  terlikEv: U("1627388484741-74dcc56ec343"),
  terlikCiftBant: U("1585120824848-8a5cd41493d2"),
  topuklu: U("1789110519471-74ac17dd1cf6"),
  sandalet: U("1596523027665-9da35ced2388"),
};

/** ürün slug → yeni görsel. Listede olmayan ürüne dokunulmaz. */
const productImages = {
  "klasik-beyaz-sneaker": img.sneakerWhite,
  "deri-platform-sneaker": img.sneakerPlatform,
  "modern-sport-sneaker": img.sneakerSport,
  "deri-babet": img.babet,
  "sivri-burun-suet-babet": img.babet,
  "suet-bot": img.botSuet,
  "deri-bilekli-bot": img.botDeri,
  "deri-ev-terligi": img.terlikEv,
  "cift-bantli-terlik": img.terlikCiftBant,
  "klasik-topuklu": img.topuklu,
  "ipli-sandalet": img.sandalet,
  // "suet-detayli-sneaker" bilinçli olarak atlandı — mevcut görseli markasız.
};

const categoryImages = {
  sneaker: img.catSneaker,
  babet: img.babet,
  bot: img.botDeri,
  terlik: img.terlikEv,
  topuklu: img.topuklu,
  sandalet: img.sandalet,
};

const apply = process.argv.includes("--uygula");

(async () => {
  console.log(apply ? "== UYGULANIYOR ==\n" : "== ONIZLEME (yazmaz) ==\n");
  let changed = 0;

  console.log("--- URUN GORSELLERI ---");
  for (const [slug, url] of Object.entries(productImages)) {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true, images: { select: { id: true, url: true } } },
    });

    if (!product) {
      console.log(`  ! BULUNAMADI: ${slug}`);
      continue;
    }
    if (product.images.length === 0) {
      console.log(`  ! GORSEL KAYDI YOK: ${slug}`);
      continue;
    }

    for (const image of product.images) {
      if (image.url === url) continue;
      console.log(`  ${product.name}`);
      console.log(`     eski: ...${image.url.slice(30, 60)}`);
      console.log(`     yeni: ...${url.slice(30, 60)}`);
      changed++;
      if (apply) {
        await prisma.productImage.update({ where: { id: image.id }, data: { url } });
      }
    }
  }

  console.log("\n--- KATEGORI GORSELLERI ---");
  for (const [slug, url] of Object.entries(categoryImages)) {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true, image: true },
    });
    if (!category) {
      console.log(`  ! BULUNAMADI: ${slug}`);
      continue;
    }
    if (category.image === url) continue;
    console.log(`  ${category.name}: ...${(category.image || "").slice(30, 60)} -> ...${url.slice(30, 60)}`);
    changed++;
    if (apply) {
      await prisma.category.update({ where: { id: category.id }, data: { image: url } });
    }
  }

  console.log(`\nToplam ${changed} kayit ${apply ? "guncellendi" : "guncellenecek"}.`);
  if (!apply) console.log("Yazmak icin: node fix-images.js --uygula");

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
