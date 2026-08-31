"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/store/cart";
import { cn, formatPrice } from "@/lib/utils";

export type PanelVariant = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
  price: number | null;
};

type Props = {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  image: string | null;
  variants: PanelVariant[];
};

export function ProductPurchasePanel({
  productId,
  slug,
  name,
  basePrice,
  image,
  variants,
}: Props) {
  const addItem = useCart((s) => s.addItem);

  const colors = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const v of variants) if (!map.has(v.color)) map.set(v.color, v.colorHex);
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [variants]);

  const [color, setColor] = useState(colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Seçili renge ait numaralar, numara sırasına göre
  const sizesForColor = useMemo(
    () =>
      variants
        .filter((v) => v.color === color)
        .sort((a, b) => Number(a.size) - Number(b.size)),
    [variants, color]
  );

  const selected = sizesForColor.find((v) => v.size === size) ?? null;
  const price = selected?.price ?? basePrice;

  function handleAdd() {
    if (!selected || selected.stock <= 0) return;
    addItem({
      variantId: selected.id,
      productId,
      slug,
      name,
      size: selected.size,
      color: selected.color,
      price,
      image,
      maxStock: selected.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <>
      {/* Fiyat okunabilirlik için serif (Playfair) yerine gövde fontu Montserrat ile. */}
      <p className="mb-stack-sm font-body-md text-headline-sm tracking-[0.01em] text-tertiary">
        {formatPrice(price)}
      </p>

      {/* Renk */}
      {colors.length > 0 && (
        <div className="mb-stack-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface">
              Renk: {color}
            </span>
          </div>
          <div className="flex gap-4">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setColor(c.name);
                  setSize(null);
                }}
                aria-label={c.name}
                aria-pressed={c.name === color}
                title={c.name}
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-300",
                  c.name === color
                    ? "border-2 border-primary ring-2 ring-primary/30"
                    : "border border-outline-variant hover:border-outline"
                )}
                style={{ backgroundColor: c.hex ?? "#e3e2e0" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Numara */}
      <div className="mb-stack-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-label-caps text-label-caps uppercase text-on-surface">Numara</span>
          {selected && selected.stock > 0 && selected.stock <= 3 && (
            <span className="font-label-caps text-label-caps uppercase text-error">
              Son {selected.stock} adet
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {sizesForColor.map((v) => {
            const soldOut = v.stock <= 0;
            const active = v.size === size;
            return (
              <button
                key={v.id}
                onClick={() => !soldOut && setSize(v.size)}
                disabled={soldOut}
                aria-pressed={active}
                className={cn(
                  "rounded border py-3 font-body-sm text-body-sm transition-colors duration-300",
                  soldOut
                    ? "cursor-not-allowed border-outline-variant bg-surface-container-low text-on-surface-variant/50 line-through"
                    : active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-outline-variant text-on-surface hover:border-primary"
                )}
              >
                {v.size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aksiyonlar */}
      <div className="mb-stack-lg flex flex-col gap-4">
        <button
          onClick={handleAdd}
          disabled={!selected}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded py-4 font-label-caps text-label-caps uppercase transition-colors duration-300",
            added
              ? "bg-primary text-on-primary"
              : "bg-tertiary text-on-tertiary hover:bg-on-tertiary-fixed-variant",
            !selected && "cursor-not-allowed opacity-40"
          )}
        >
          {added ? (
            <>
              <Icon name="check" className="text-[18px]" />
              Sepete Eklendi
            </>
          ) : !selected ? (
            "Numara Seçin"
          ) : (
            "Sepete Ekle"
          )}
        </button>
      </div>
    </>
  );
}

export default ProductPurchasePanel;
