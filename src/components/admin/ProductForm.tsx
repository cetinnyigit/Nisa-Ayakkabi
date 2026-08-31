"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ProductImages, { type ProductImageData } from "@/components/admin/ProductImages";
import ProductVariants, { type VariantData } from "@/components/admin/ProductVariants";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { createProduct, updateProduct, type ProductInput } from "@/app/admin/product-actions";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 " +
  "font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0";

const labelClass = "mb-1 block font-label-caps text-label-caps uppercase text-on-surface-variant";

export type ProductFormData = ProductInput & { id?: string };

type Option = { id: string; name: string };

const genders = [
  { value: "kadin", label: "Kadın" },
  { value: "erkek", label: "Erkek" },
  { value: "cocuk", label: "Çocuk" },
  { value: "unisex", label: "Unisex" },
];

const seasons = [
  { value: "4mevsim", label: "4 Mevsim" },
  { value: "yaz", label: "Yaz" },
  { value: "kis", label: "Kış" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export function ProductForm({
  initial,
  categories,
  brands,
  uploadEnabled,
}: {
  initial: ProductFormData;
  categories: Option[];
  brands: Option[];
  uploadEnabled?: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<ProductFormData>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const isNew = !initial.id;

  // Yeni üründe görsel/numara bağlanacak bir kayıt henüz yok; formda toplanıp
  // "Ürünü Oluştur"da ürünle birlikte tek işlemde yazılırlar. Düzenlemede ise
  // bu bölümler sayfanın üstünde, kendi server action'larıyla çalışır.
  const [draftImages, setDraftImages] = useState<ProductImageData[]>([]);
  const [draftVariants, setDraftVariants] = useState<VariantData[]>([]);

  function set<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        if (isNew) {
          const id = await createProduct({
            ...data,
            images: draftImages.map((img) => ({ url: img.url, alt: img.alt })),
            variants: draftVariants.map((v) => ({
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              stock: v.stock,
            })),
          });
          router.push(`/admin/urunler/${id}`);
        } else {
          await updateProduct(initial.id!, data);
          setSaved(true);
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kaydedilemedi.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-stack-sm">
      {isNew && (
        <>
          <ProductImages
            images={draftImages}
            onChange={setDraftImages}
            uploadEnabled={uploadEnabled}
          />
          <ProductVariants variants={draftVariants} onChange={setDraftVariants} />
        </>
      )}

      <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
        <h2 className="mb-4 border-b border-outline-variant/30 pb-3 font-headline-sm text-headline-sm text-on-surface">
          Temel Bilgiler
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Ürün Adı">
            <input
              required
              className={inputClass}
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Ürün Kodu (SKU)">
            <input
              className={inputClass}
              value={data.sku ?? ""}
              onChange={(e) => set("sku", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Açıklama">
              <textarea
                required
                rows={4}
                className={inputClass}
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Bağlantı Adresi (slug)">
            <input
              className={inputClass}
              placeholder="Boş bırakılırsa addan üretilir"
              value={data.slug ?? ""}
              onChange={(e) => set("slug", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
        <h2 className="mb-4 border-b border-outline-variant/30 pb-3 font-headline-sm text-headline-sm text-on-surface">
          Fiyat ve Sınıflandırma
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Fiyat (₺)">
            <input
              required
              type="number"
              min={1}
              step="0.01"
              className={inputClass}
              value={data.price}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </Field>
          <Field label="Karşılaştırma Fiyatı (₺)">
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="İndirim yoksa boş"
              className={inputClass}
              value={data.comparePrice ?? ""}
              onChange={(e) =>
                set("comparePrice", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label="Kategori">
            <select
              required
              className={inputClass}
              value={data.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
            >
              <option value="">Seçin…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Marka">
            {/* Serbest metin; datalist yalnızca öneri sunar, yazılan yeni marka
                kaydedilirken otomatik oluşturulur. */}
            <input
              className={inputClass}
              list="marka-onerileri"
              placeholder="Markasız bırakmak için boş bırakın"
              value={data.brand ?? ""}
              onChange={(e) => set("brand", e.target.value)}
            />
            <datalist id="marka-onerileri">
              {brands.map((b) => (
                <option key={b.id} value={b.name} />
              ))}
            </datalist>
          </Field>
          <Field label="Cinsiyet">
            <select
              className={inputClass}
              value={data.gender ?? ""}
              onChange={(e) => set("gender", e.target.value || null)}
            >
              <option value="">Seçilmedi</option>
              {genders.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sezon">
            <select
              className={inputClass}
              value={data.season ?? ""}
              onChange={(e) => set("season", e.target.value || null)}
            >
              <option value="">Seçilmedi</option>
              {seasons.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
        <h2 className="mb-4 border-b border-outline-variant/30 pb-3 font-headline-sm text-headline-sm text-on-surface">
          Ayakkabı Özellikleri
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Saya">
            <input
              className={inputClass}
              placeholder="Hakiki deri"
              value={data.material ?? ""}
              onChange={(e) => set("material", e.target.value)}
            />
          </Field>
          <Field label="Taban">
            <input
              className={inputClass}
              placeholder="Kauçuk"
              value={data.soleMaterial ?? ""}
              onChange={(e) => set("soleMaterial", e.target.value)}
            />
          </Field>
          <Field label="Topuk (cm)">
            <input
              type="number"
              min={0}
              step="0.5"
              className={inputClass}
              value={data.heelHeight ?? ""}
              onChange={(e) =>
                set("heelHeight", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
        <h2 className="mb-4 border-b border-outline-variant/30 pb-3 font-headline-sm text-headline-sm text-on-surface">
          Vitrin
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(
            [
              ["active", "Satışta", "Kapalıysa ürün mağazada hiç görünmez."],
              ["featured", "Öne çıkan", "Vitrin alanlarında öncelikli gösterilir."],
              ["bestSeller", "Çok satan", "Ana sayfadaki Çok Satanlar bölümüne girer."],
              ["newArrival", "Yeni gelen", "Ana sayfadaki Yeni Gelenler bölümüne girer."],
            ] as const
          ).map(([key, label, hint]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded border border-outline-variant/50 px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block font-body-md text-body-md text-on-surface">{label}</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">
                  {hint}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "font-label-caps text-label-caps uppercase",
                    data[key] ? "text-success" : "text-error"
                  )}
                >
                  {data[key] ? "Açık" : "Kapalı"}
                </span>
                <ToggleSwitch
                  checked={data[key]}
                  label={label}
                  onToggle={async (next) => set(key, next)}
                />
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
          Bu anahtarlar formu kaydettiğinizde uygulanır.
        </p>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-tertiary px-8 py-3 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant disabled:opacity-50"
        >
          {pending ? "Kaydediliyor…" : isNew ? "Ürünü Oluştur" : "Değişiklikleri Kaydet"}
        </button>
        {saved && <span className="font-body-sm text-body-sm text-primary">Kaydedildi.</span>}
        {isNew && draftVariants.length === 0 && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Numara eklemeden kaydederseniz ürün satın alınamaz.
          </span>
        )}
      </div>
    </form>
  );
}

export default ProductForm;
