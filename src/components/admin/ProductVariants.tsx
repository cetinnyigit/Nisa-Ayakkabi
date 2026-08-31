"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { addVariants, deleteVariant, setVariantStock } from "@/app/admin/product-actions";
import { cn } from "@/lib/utils";

/** Ayakkabıda pratikte kullanılan numara aralığı — çocuktan erkeğe. */
const SIZE_PRESETS = Array.from({ length: 27 }, (_, i) => String(20 + i));

export type VariantData = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
};

const inputClass =
  "rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 " +
  "font-body-md text-body-md focus:border-primary focus:ring-0";

function StockInput({
  variantId,
  stock,
  onLocalSave,
}: {
  variantId: string;
  stock: number;
  onLocalSave?: (variantId: string, stock: number) => void;
}) {
  const [value, setValue] = useState(stock);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function save(next: number) {
    if (!Number.isInteger(next) || next < 0 || next === stock) {
      if (next === stock) return;
      if (!Number.isInteger(next) || next < 0) {
        setValue(stock);
        return;
      }
    }
    setError(false);

    if (onLocalSave) {
      onLocalSave(variantId, next);
      return;
    }

    startTransition(async () => {
      try {
        await setVariantStock(variantId, next);
      } catch {
        setValue(stock);
        setError(true);
      }
    });
  }

  return (
    <input
      type="number"
      min={0}
      value={value}
      disabled={pending}
      onChange={(e) => setValue(Number(e.target.value))}
      onBlur={(e) => save(Number(e.target.value))}
      className={cn(
        "w-20 rounded border bg-surface-container-lowest px-2 py-1 font-body-sm text-body-sm focus:ring-0",
        error ? "border-error" : "border-outline-variant focus:border-primary",
        value === 0 && "text-error"
      )}
    />
  );
}

/**
 * ProductImages ile aynı iki modu destekler: kayıtlı üründe (productId) doğrudan
 * server action'a yazar, taslakta (onChange) listeyi formda tutar.
 */
export function ProductVariants({
  productId,
  variants,
  onChange,
}: {
  productId?: string;
  variants: VariantData[];
  onChange?: (next: VariantData[]) => void;
}) {
  const [form, setForm] = useState({ color: "", colorHex: "#1a1c1a", stock: 5 });
  const [sizes, setSizes] = useState<string[]>([]);
  const [extraSizes, setExtraSizes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Aynı renkteki numaraları bir arada göstermek okumayı kolaylaştırıyor
  const byColor = variants.reduce<Record<string, VariantData[]>>((acc, v) => {
    (acc[v.color] ??= []).push(v);
    return acc;
  }, {});

  // Izgaradan seçilenler + elle yazılan ek numaralar ("28, 29" gibi)
  const selectedSizes = Array.from(
    new Set([...sizes, ...extraSizes.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)])
  );

  function toggleSize(size: string) {
    setError(null);
    setSizes((list) => (list.includes(size) ? list.filter((s) => s !== size) : [...list, size]));
  }

  function add() {
    setError(null);

    if (onChange) {
      const color = form.color.trim();
      const taken = new Set(variants.filter((v) => v.color === color).map((v) => v.size));
      const fresh = selectedSizes.filter((size) => !taken.has(size));

      if (fresh.length === 0) {
        setError(`Seçilen numaralar ${color} rengi için zaten ekli.`);
        return;
      }

      onChange([
        ...variants,
        ...fresh.map((size) => ({
          id: crypto.randomUUID(),
          size,
          color,
          colorHex: form.colorHex,
          stock: form.stock,
        })),
      ]);
      setSizes([]);
      setExtraSizes("");
      return;
    }

    startTransition(async () => {
      try {
        await addVariants(productId!, { ...form, sizes: selectedSizes });
        setSizes([]);
        setExtraSizes("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Numaralar eklenemedi.");
      }
    });
  }

  function remove(variantId: string) {
    setError(null);

    if (onChange) {
      onChange(variants.filter((v) => v.id !== variantId));
      return;
    }

    startTransition(async () => {
      try {
        await deleteVariant(variantId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Numara silinemedi.");
      }
    });
  }

  function setLocalStock(variantId: string, stock: number) {
    onChange?.(variants.map((v) => (v.id === variantId ? { ...v, stock } : v)));
  }

  const totalStock = variants.reduce((n, v) => n + v.stock, 0);

  return (
    <section className="rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Numaralar ve Stok</h2>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {variants.length} numara · toplam {totalStock} adet
        </span>
      </div>

      {variants.length === 0 ? (
        <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
          Numara eklenmeden ürün satın alınamaz — müşteri numara seçemez.
        </p>
      ) : (
        <div className="mb-6 space-y-4">
          {Object.entries(byColor).map(([color, list]) => (
            <div key={color}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-outline-variant"
                  style={{ backgroundColor: list[0].colorHex ?? "#e3e2e0" }}
                />
                <span className="font-label-caps text-label-caps uppercase text-on-surface">
                  {color}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {list
                  .sort((a, b) => Number(a.size) - Number(b.size))
                  .map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-2 rounded border border-outline-variant/50 px-3 py-2"
                    >
                      <span className="font-body-md text-body-md text-on-surface">{v.size}</span>
                      <StockInput
                        variantId={v.id}
                        stock={v.stock}
                        onLocalSave={onChange ? setLocalStock : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => remove(v.id)}
                        disabled={pending}
                        aria-label={`${color} ${v.size} numarasını sil`}
                        className="text-on-surface-variant transition-colors hover:text-error disabled:opacity-50"
                      >
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-outline-variant/30 pt-4">
        <p className="mb-3 font-label-caps text-label-caps uppercase text-on-surface-variant">
          Numara Ekle
        </p>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block font-body-sm text-[12px] text-on-surface-variant">
              Renk
            </label>
            <input
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              placeholder="Siyah"
              className={cn(inputClass, "w-36")}
            />
          </div>
          <div>
            <label className="mb-1 block font-body-sm text-[12px] text-on-surface-variant">
              Renk kodu
            </label>
            <input
              type="color"
              value={form.colorHex}
              onChange={(e) => setForm((f) => ({ ...f, colorHex: e.target.value }))}
              className="h-[42px] w-16 cursor-pointer rounded border border-outline-variant bg-surface-container-lowest"
            />
          </div>
          <div>
            <label className="mb-1 block font-body-sm text-[12px] text-on-surface-variant">
              Her numara için stok
            </label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              className={cn(inputClass, "w-32")}
            />
          </div>
        </div>

        <label className="mb-2 block font-body-sm text-[12px] text-on-surface-variant">
          Numaralar — birden fazla seçebilirsiniz
        </label>
        <div className="mb-3 flex flex-wrap gap-2">
          {SIZE_PRESETS.map((size) => {
            const already = form.color.trim()
              ? variants.some((v) => v.color === form.color.trim() && v.size === size)
              : false;
            const picked = sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                disabled={already || pending}
                aria-pressed={picked}
                title={already ? `${form.color} renginde ${size} zaten ekli` : undefined}
                className={cn(
                  "h-10 w-12 rounded border font-body-md text-body-md transition-colors duration-150",
                  picked
                    ? "border-tertiary bg-tertiary text-on-tertiary"
                    : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-tertiary",
                  already && "cursor-not-allowed opacity-30 hover:border-outline-variant"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block font-body-sm text-[12px] text-on-surface-variant">
              Listede olmayan numara
            </label>
            <input
              value={extraSizes}
              onChange={(e) => setExtraSizes(e.target.value)}
              placeholder="47, 48"
              className={cn(inputClass, "w-40")}
            />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={pending || selectedSizes.length === 0 || !form.color.trim()}
            className="rounded bg-tertiary px-6 py-2.5 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant disabled:opacity-40"
          >
            {selectedSizes.length > 0 ? `${selectedSizes.length} Numarayı Ekle` : "Numara Ekle"}
          </button>
          {!form.color.trim() && (
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Önce renk yazın.
            </span>
          )}
        </div>
      </div>

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

export default ProductVariants;
