"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ImageField from "@/components/admin/ImageField";
import { saveHeroBanner, type HeroInput } from "@/app/admin/appearance-actions";

const inputClass =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 " +
  "font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0";
const labelClass = "mb-1 block font-label-caps text-label-caps uppercase text-on-surface-variant";

export function HeroBannerEditor({
  initial,
  uploadEnabled,
}: {
  initial: HeroInput;
  uploadEnabled: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<HeroInput>(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof HeroInput>(key: K, value: HeroInput[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setMessage(null);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveHeroBanner(data);
        setMessage({ ok: true, text: "Kaydedildi — ana sayfa güncellendi." });
        router.refresh();
      } catch (err) {
        setMessage({ ok: false, text: err instanceof Error ? err.message : "Kaydedilemedi." });
      }
    });
  }

  return (
    <form
      onSubmit={save}
      className="mb-stack-md rounded-lg bg-surface-container-lowest p-6 shadow-ambient"
    >
      <h2 className="mb-1 font-headline-sm text-headline-sm text-on-surface">
        Ana Sayfa Hero Bannerı
      </h2>
      <p className="mb-6 border-b border-outline-variant/30 pb-3 font-body-sm text-body-sm text-on-surface-variant">
        Ana sayfanın en üstündeki büyük görsel ve yazılar.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ImageField
          label="Hero görseli"
          value={data.image}
          onChange={(url) => set("image", url)}
          uploadEnabled={uploadEnabled}
          folder="banner"
          hint="Yatay, en az 2000 px genişliğinde bir görsel önerilir. En fazla 5 MB."
        />

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Üst başlık</label>
            <input
              className={inputClass}
              placeholder="ör. Sonbahar Seçkisi"
              value={data.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Başlık *</label>
            <input
              className={inputClass}
              value={data.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Açıklama</label>
            <textarea
              rows={3}
              className={inputClass}
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Buton yazısı</label>
              <input
                className={inputClass}
                value={data.buttonText}
                onChange={(e) => set("buttonText", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Buton bağlantısı</label>
              <input
                className={inputClass}
                placeholder="/koleksiyonlar"
                value={data.link}
                onChange={(e) => set("link", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-primary px-6 py-3 font-label-caps text-label-caps uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {message && (
          <p
            role={message.ok ? "status" : "alert"}
            className={`font-body-sm text-body-sm ${message.ok ? "text-primary" : "text-error"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}

export default HeroBannerEditor;
