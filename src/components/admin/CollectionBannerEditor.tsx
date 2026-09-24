"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ImageField from "@/components/admin/ImageField";
import {
  saveCollectionBanner,
  type CollectionBannerInput,
} from "@/app/admin/appearance-actions";

const inputClass =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 " +
  "font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0";
const labelClass = "mb-1 block font-label-caps text-label-caps uppercase text-on-surface-variant";

export function CollectionBannerEditor({
  slug,
  title,
  initial,
  defaults,
  uploadEnabled,
}: {
  slug: string;
  title: string;
  initial: CollectionBannerInput;
  defaults: { eyebrow: string; tagline: string };
  uploadEnabled: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<CollectionBannerInput>(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function set(key: keyof CollectionBannerInput, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    setMessage(null);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveCollectionBanner(slug, data);
        setMessage({ ok: true, text: "Kaydedildi." });
        router.refresh();
      } catch (err) {
        setMessage({ ok: false, text: err instanceof Error ? err.message : "Kaydedilemedi." });
      }
    });
  }

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-ambient"
    >
      <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>

      <ImageField
        label="Banner görseli"
        value={data.image}
        onChange={(url) => set("image", url)}
        uploadEnabled={uploadEnabled}
        folder="banner"
        aspect="aspect-[4/5]"
        hint="Boş bırakılırsa koleksiyondaki en yeni ürünün görseli kullanılır."
      />
      <div>
        <label className={labelClass}>Üst başlık</label>
        <input
          className={inputClass}
          placeholder={defaults.eyebrow}
          value={data.eyebrow}
          onChange={(e) => set("eyebrow", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Slogan</label>
        <input
          className={inputClass}
          placeholder={defaults.tagline}
          value={data.tagline}
          onChange={(e) => set("tagline", e.target.value)}
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-primary px-5 py-2 font-label-caps text-label-caps uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
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

export default CollectionBannerEditor;
