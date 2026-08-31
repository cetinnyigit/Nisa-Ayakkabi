"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/store/cart";
import { cn, formatPrice } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
  price: number | null;
};

type Payload = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  variants: Variant[];
};

/**
 * Ürün kartı üzerinde hover'da beliren "Hızlı Ekle" butonu ve
 * buzlu cam görünümlü numara seçim paneli.
 */
export function QuickAdd({ slug }: { slug: string }) {
  const addItem = useCart((s) => s.addItem);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  async function openPanel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    if (data || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/urun/${slug}/varyantlar`);
      if (!res.ok) throw new Error("Varyantlar alınamadı");
      const payload: Payload = await res.json();
      setData(payload);
      setColor(payload.variants[0]?.color ?? null);
    } catch {
      setError("Numaralar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  function close(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  }

  function add(variant: Variant, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!data || variant.stock <= 0) return;

    addItem({
      variantId: variant.id,
      productId: data.productId,
      slug,
      name: data.name,
      size: variant.size,
      color: variant.color,
      price: variant.price ?? data.price,
      image: data.image,
      maxStock: variant.stock,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setOpen(false);
    }, 1200);
  }

  const colors = data ? Array.from(new Set(data.variants.map((v) => v.color))) : [];
  const sizes = data
    ? data.variants
        .filter((v) => v.color === color)
        .sort((a, b) => Number(a.size) - Number(b.size))
    : [];

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 p-4">
      {!open ? (
        <button
          onClick={openPanel}
          className="w-full translate-y-[calc(100%+1rem)] border border-outline-variant bg-surface/90 py-3 font-label-caps text-label-caps uppercase text-on-surface opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-tertiary hover:text-on-tertiary group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          Hızlı Ekle
        </button>
      ) : (
        <div className="rounded border border-outline-variant bg-surface/90 p-3 shadow-sm backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              {added ? "Eklendi" : loading ? "Yükleniyor…" : "Numara"}
            </span>
            <button onClick={close} aria-label="Kapat" className="text-on-surface-variant hover:text-error">
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>

          {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

          {colors.length > 1 && (
            <div className="mb-2 flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setColor(c);
                  }}
                  className={cn(
                    "rounded border px-2 py-1 font-body-sm text-[11px] transition-colors",
                    c === color
                      ? "border-primary text-primary"
                      : "border-outline-variant text-on-surface-variant"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-5 gap-1.5">
            {sizes.map((v) => (
              <button
                key={v.id}
                onClick={(e) => add(v, e)}
                disabled={v.stock <= 0}
                className={cn(
                  "rounded border py-1.5 font-body-sm text-[13px] transition-colors duration-300",
                  v.stock <= 0
                    ? "cursor-not-allowed border-outline-variant text-on-surface-variant/40 line-through"
                    : "border-outline-variant text-on-surface hover:border-primary hover:text-primary"
                )}
              >
                {v.size}
              </button>
            ))}
          </div>

          {data && (
            <p className="mt-2 text-center font-body-sm text-[12px] text-on-surface-variant">
              {formatPrice(data.price)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default QuickAdd;
