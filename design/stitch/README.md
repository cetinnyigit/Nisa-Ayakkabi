# Stitch Tasarım Kaynakları

Stitch projesi: **Nisa Soft Luxury E-Commerce** — `projects/13798873788355140592`
İndirme tarihi: 2026-08-27

Bu klasördeki HTML dosyaları Stitch'ten indirilmiş **statik referans** çıktılarıdır
(Tailwind CDN + Google Fonts ile tek dosya). Uygulama kodu değildir — Next.js
sayfalarına dönüştürülürken tasarım kaynağı olarak kullanılır.

| # | Dosya | Ekran | Stitch screen ID |
|---|---|---|---|
| 01 | `01-ana-sayfa.html` | Ana Sayfa (Güncellenmiş) | `6a1e6efdaf384f00901cfbf63a4f9ecd` |
| 02 | `02-koleksiyonlar.html` | Koleksiyonlar | `a792b1a378f8494b87b1839e77f0c734` |
| 03 | `03-urun-detayi.html` | Ürün Detayı | `9622b145513c453fa649d8d2b4674c35` |
| 04 | `04-sepetim.html` | Sepetim | `3def3e0d20a34c83b72b076eeda4afbb` |
| 05 | `05-odeme.html` | Ödeme | `4962e685eb784a6dabebb70d692b0dfb` |
| 06 | `06-admin-genel-bakis.html` | Admin – Genel Bakış | `021909a7ffae4c84bed3fd91fdd59dc4` |
| 07 | `07-admin-urun-yonetimi.html` | Admin – Ürün Yönetimi | `5c7ba4eb14b04f01aebc6df50b059ed2` |
| 08 | `08-admin-kategori-yonetimi.html` | Admin – Kategori Yönetimi | `7c0c79bd9d2c4aebaf8e710ab54ac505` |
| 09 | `09-admin-siparis-yonetimi.html` | Admin – Sipariş Yönetimi | `176355cdb4f845738865c3fe097a74d8` |

`screenshots/` altında her ekranın önizleme görseli aynı numaralandırma ile duruyor.

## Design token'ları

Tema: "Nisa Ayakkabı Soft Luxury"

- **Fontlar:** Playfair Display (başlık), Montserrat (gövde/label)
- **Renkler:** primary `#755a25`, primary-container (şampanya altın) `#c5a367`,
  surface/background (krem) `#faf9f6`, on-surface `#1a1c1a`, tertiary (mocha) `#705a49`,
  outline `#7f7668`
- **Radius:** buton/input 0.5rem, kart/modal 1rem
- **Spacing:** 8px baz, container-max 1280px, gutter 24px

Tam token listesi her HTML dosyasının içindeki `<script id="tailwind-config">`
bloğunda ve Stitch design system'inde (`designMd`) mevcut.

## Yeniden indirme

Stitch download URL'leri süreli; yenilemek için MCP üzerinden
`list_screens(projectId=13798873788355140592)` çağırıp `htmlCode.downloadUrl`
alanlarını kullan.
