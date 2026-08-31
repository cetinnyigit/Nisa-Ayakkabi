"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { Icon } from "@/components/ui/Icon";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryInput,
} from "@/app/admin/category-actions";

const inputClass =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 " +
  "font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0";

const labelClass = "mb-1 block font-label-caps text-label-caps uppercase text-on-surface-variant";

export type CategoryFormData = CategoryInput & { id?: string; productCount?: number };

const blank: CategoryFormData = {
  name: "",
  nameEn: "",
  slug: "",
  description: "",
  descriptionEn: "",
  image: "",
  showInNav: false,
  navPosition: 0,
  showOnHome: false,
  homePosition: 0,
};

export function CategoryEditor({ categories }: { categories: CategoryFormData[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CategoryFormData>(blank);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function startNew() {
    setData({ ...blank, navPosition: categories.length + 1, homePosition: categories.length + 1 });
    setError(null);
    setOpen(true);
  }

  function startEdit(category: CategoryFormData) {
    setData(category);
    setError(null);
    setOpen(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (data.id) await updateCategory(data.id, data);
        else await createCategory(data);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kaydedilemedi.");
      }
    });
  }

  function remove() {
    if (!data.id) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategory(data.id!);
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Silinemedi.");
      }
    });
  }

  return (
    <>
      <div className="mb-stack-sm flex flex-wrap gap-2">
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded bg-tertiary px-6 py-3 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant"
        >
          <Icon name="add" className="text-[18px]" />
          Yeni Kategori
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => startEdit(c)}
            className="inline-flex items-center gap-2 rounded border border-outline-variant px-4 py-3 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="edit" className="text-[16px]" />
            {c.name}
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
          />

          <form
            onSubmit={save}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface p-8 shadow-ambient"
          >
            <div className="mb-6 flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                {data.id ? "Kategoriyi Düzenle" : "Yeni Kategori"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
                className="text-on-surface-variant hover:text-primary"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Ad (TR)</label>
                <input
                  required
                  className={inputClass}
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Ad (EN)</label>
                <input
                  required
                  className={inputClass}
                  value={data.nameEn}
                  onChange={(e) => set("nameEn", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Bağlantı adresi (slug)</label>
                <input
                  className={inputClass}
                  placeholder="Boş bırakılırsa addan üretilir"
                  value={data.slug ?? ""}
                  onChange={(e) => set("slug", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Görsel adresi</label>
                <input
                  className={inputClass}
                  placeholder="https://…"
                  value={data.image ?? ""}
                  onChange={(e) => set("image", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Açıklama (TR)</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={data.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Açıklama (EN)</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={data.descriptionEn ?? ""}
                  onChange={(e) => set("descriptionEn", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={data.showInNav}
                  label="Menüde göster"
                  onToggle={async (next) => set("showInNav", next)}
                />
                <span className="font-body-md text-body-md text-on-surface">Menüde</span>
                <input
                  type="number"
                  min={0}
                  className={`${inputClass} w-20`}
                  value={data.navPosition}
                  onChange={(e) => set("navPosition", Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={data.showOnHome}
                  label="Ana sayfada göster"
                  onToggle={async (next) => set("showOnHome", next)}
                />
                <span className="font-body-md text-body-md text-on-surface">Ana sayfada</span>
                <input
                  type="number"
                  min={0}
                  className={`${inputClass} w-20`}
                  value={data.homePosition}
                  onChange={(e) => set("homePosition", Number(e.target.value))}
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded border border-error/30 bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/30 pt-4">
              <button
                type="submit"
                disabled={pending}
                className="rounded bg-tertiary px-8 py-3 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant disabled:opacity-50"
              >
                {pending ? "Kaydediliyor…" : data.id ? "Kaydet" : "Oluştur"}
              </button>

              {data.id && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={pending || (data.productCount ?? 0) > 0}
                  title={
                    (data.productCount ?? 0) > 0
                      ? "Ürünü olan kategori silinemez"
                      : "Kategoriyi sil"
                  }
                  className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface-variant transition-colors hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="delete" className="text-[18px]" />
                  Sil
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default CategoryEditor;
