"use client";

import SafeImage from "@/components/ui/SafeImage";
import { useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { addProductImage, removeProductImage } from "@/app/admin/product-actions";
import { allowedHostsMessage, isAllowedImageHost } from "@/lib/images";

export type ProductImageData = { id: string; url: string; alt: string | null };

/**
 * İki modda çalışır:
 *  - Kayıtlı ürün (productId verilir): her değişiklik anında server action'a yazılır.
 *  - Taslak (onChange verilir): ürün henüz yokken liste formda tutulur, kaydetmede
 *    ürünle birlikte tek seferde oluşturulur.
 */
export function ProductImages({
  productId,
  images,
  onChange,
  uploadEnabled = true,
}: {
  productId?: string;
  images: ProductImageData[];
  onChange?: (next: ProductImageData[]) => void;
  /** BLOB_READ_WRITE_TOKEN tanımlı mı — sunucuda okunup buraya aktarılır. */
  uploadEnabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // Token baştan yoksa dosya seçtirmeyip boşuna 503 almayı engelliyoruz.
  const [uploadDisabled, setUploadDisabled] = useState(!uploadEnabled);
  const [pending, startTransition] = useTransition();

  /** Taslakta yerel listeye ekler, kayıtlı üründe server action'a yazar. */
  function commitAdd(nextUrl: string) {
    if (onChange) {
      if (!isAllowedImageHost(nextUrl)) {
        setError(`Bu adres desteklenmiyor. İzin verilen kaynaklar: ${allowedHostsMessage()}.`);
        return false;
      }
      onChange([...images, { id: crypto.randomUUID(), url: nextUrl, alt: null }]);
      return true;
    }

    startTransition(async () => {
      try {
        await addProductImage(productId!, nextUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Görsel kaydedilemedi.");
      }
    });
    return true;
  }

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/gorsel", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Görsel yüklenemedi.");
        // Yapılandırma yoksa dosya seçtirmeyi kapat, URL alanı kullanılsın
        if (data.notConfigured) setUploadDisabled(true);
        return;
      }

      commitAdd(data.url);
    } catch {
      setError("Yükleme sırasında bağlantı hatası.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addByUrl() {
    if (!url.trim()) return;
    setError(null);
    if (commitAdd(url.trim())) setUrl("");
  }

  function remove(imageId: string) {
    setError(null);

    if (onChange) {
      onChange(images.filter((img) => img.id !== imageId));
      return;
    }

    startTransition(async () => {
      try {
        await removeProductImage(imageId);
      } catch {
        setError("Görsel silinemedi.");
      }
    });
  }

  return (
    <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
      <h2 className="mb-4 border-b border-outline-variant/30 pb-3 font-headline-sm text-headline-sm text-on-surface">
        Görseller
      </h2>

      {images.length === 0 ? (
        <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
          Henüz görsel yok. İlk görsel, listelerde kapak olarak kullanılır.
        </p>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.id} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded bg-surface-container">
                <SafeImage src={img.url} alt={img.alt ?? ""} fill sizes="20vw" className="object-cover" />
              </div>
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-surface/90 px-2 py-1 font-label-caps text-[10px] uppercase text-primary backdrop-blur-md">
                  Kapak
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(img.id)}
                disabled={pending}
                aria-label="Görseli sil"
                className="absolute right-2 top-2 rounded-full bg-surface/90 p-1 text-on-surface-variant backdrop-blur-md transition-colors hover:text-error disabled:opacity-50"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-label-caps text-label-caps uppercase text-on-surface-variant">
            Dosyadan yükle
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={uploading || uploadDisabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
            className="w-full font-body-sm text-body-sm text-on-surface-variant file:mr-3 file:rounded file:border-0 file:bg-secondary-container file:px-4 file:py-2 file:font-label-caps file:text-label-caps file:uppercase file:text-on-secondary-container disabled:opacity-50"
          />
          <p className="mt-1 font-body-sm text-[12px] text-on-surface-variant">
            {uploadDisabled
              ? "Dosya yükleme kapalı — .env dosyasında BLOB_READ_WRITE_TOKEN tanımlı değil. " +
                "Yandaki alana görsel adresi yapıştırabilirsiniz."
              : "JPEG / PNG / WebP / AVIF, en fazla 5 MB."}
          </p>
        </div>

        <div>
          <label className="mb-1 block font-label-caps text-label-caps uppercase text-on-surface-variant">
            veya görsel adresi yapıştır
          </label>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByUrl())}
              placeholder="https://…"
              className="w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md focus:border-primary focus:ring-0"
            />
            <button
              type="button"
              onClick={addByUrl}
              disabled={pending || !url.trim()}
              className="shrink-0 rounded border border-primary-container px-4 font-label-caps text-label-caps uppercase text-primary transition-colors hover:bg-primary-fixed/40 disabled:opacity-40"
            >
              Ekle
            </button>
          </div>
        </div>
      </div>

      {uploading && (
        <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">Yükleniyor…</p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded border border-error/30 bg-error-container px-4 py-2 font-body-sm text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}
    </section>
  );
}

export default ProductImages;
