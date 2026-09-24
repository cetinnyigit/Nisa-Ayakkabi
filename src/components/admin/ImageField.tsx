"use client";

import { useRef, useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { Icon } from "@/components/ui/Icon";
import { allowedHostsMessage, isAllowedImageHost } from "@/lib/images";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 " +
  "font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0";

/**
 * Tek görsellik alan: dosyadan yükle (Vercel Blob) ya da adres yapıştır, önizle, kaldır.
 * Değer her zaman bir URL'dir; boş string "görsel yok" demektir.
 */
export function ImageField({
  label,
  value,
  onChange,
  uploadEnabled,
  folder = "genel",
  hint,
  aspect = "aspect-[16/9]",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadEnabled: boolean;
  /** Blob'da dosyanın konacağı klasör (urunler, banner, kategori…) */
  folder?: string;
  hint?: string;
  /** Önizleme kutusunun oranı (Tailwind sınıfı) */
  aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draftUrl, setDraftUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/admin/gorsel", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Görsel yüklenemedi.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Yükleme sırasında bağlantı hatası.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function applyUrl() {
    const url = draftUrl.trim();
    if (!url) return;
    if (!isAllowedImageHost(url)) {
      setError(`Bu adres desteklenmiyor. İzin verilen kaynaklar: ${allowedHostsMessage()}.`);
      return;
    }
    setError(null);
    onChange(url);
    setDraftUrl("");
  }

  return (
    <div>
      <span className="mb-1 block font-label-caps text-label-caps uppercase text-on-surface-variant">
        {label}
      </span>

      <div
        className={cn(
          "relative mb-3 overflow-hidden rounded border border-outline-variant/40 bg-surface-container",
          aspect
        )}
      >
        {value ? (
          <>
            <SafeImage src={value} alt="" fill sizes="480px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Görseli kaldır"
              className="absolute right-2 top-2 rounded-full bg-surface/90 p-1 text-on-surface-variant backdrop-blur-md transition-colors hover:text-error"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-on-surface-variant/70">
            <Icon name="image" className="text-[32px]" />
            <span className="font-body-sm text-body-sm">Görsel seçilmedi</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70 font-body-sm text-body-sm">
            Yükleniyor…
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={!uploadEnabled || uploading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-secondary-container px-4 py-2 font-label-caps text-label-caps uppercase text-on-secondary-container transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Icon name="upload" className="text-[18px]" />
          Dosya yükle
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        <div className="flex flex-grow gap-2">
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
            placeholder="veya görsel adresi yapıştır"
            className={inputClass}
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!draftUrl.trim()}
            className="shrink-0 rounded border border-primary-container px-3 font-label-caps text-label-caps uppercase text-primary transition-colors hover:bg-primary-fixed/40 disabled:opacity-40"
          >
            Kullan
          </button>
        </div>
      </div>

      <p className="mt-1 font-body-sm text-[12px] text-on-surface-variant">
        {uploadEnabled
          ? hint ?? "JPEG / PNG / WebP / AVIF, en fazla 5 MB."
          : "Dosya yükleme kapalı (Vercel Blob bağlı değil). Görsel adresi yapıştırabilirsiniz."}
      </p>
      {error && (
        <p role="alert" className="mt-2 font-body-sm text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default ImageField;
