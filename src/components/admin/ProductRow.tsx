"use client";

import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { useState, useTransition } from "react";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { Icon } from "@/components/ui/Icon";
import {
  toggleProductActive,
  updateProductFlags,
  updateProductPrice,
} from "@/app/admin/actions";
import { cn, formatPrice } from "@/lib/utils";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category: string;
  price: number;
  image: string | null;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  totalStock: number;
  variantCount: number;
};

function PriceEditor({ productId, price }: { productId: string; price: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(price));
  const [current, setCurrent] = useState(price);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0) {
      setError("Geçersiz fiyat");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateProductPrice(productId, next);
        setCurrent(next);
        setEditing(false);
      } catch {
        setError("Kaydedilemedi");
      }
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="font-body-md text-body-md text-on-surface transition-colors hover:text-primary"
        title="Fiyatı düzenle"
      >
        {formatPrice(current)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        type="number"
        min={1}
        step={10}
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setEditing(false);
            setValue(String(current));
          }
        }}
        className="w-24 rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 font-body-sm text-body-sm focus:border-primary focus:ring-0"
      />
      <button onClick={save} disabled={pending} className="text-primary" aria-label="Kaydet">
        <Icon name="check" className="text-[18px]" />
      </button>
      <button
        onClick={() => {
          setEditing(false);
          setValue(String(current));
          setError(null);
        }}
        className="text-on-surface-variant"
        aria-label="İptal"
      >
        <Icon name="close" className="text-[18px]" />
      </button>
      {error && <span className="font-body-sm text-[12px] text-error">{error}</span>}
    </div>
  );
}

export function ProductRow({ product }: { product: AdminProduct }) {
  return (
    <tr className="border-b border-outline-variant/20 last:border-0">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-surface-container">
            {product.image && (
              <SafeImage src={product.image} alt="" fill sizes="48px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/urun/${product.slug}`}
              className="block truncate font-body-md text-body-md text-on-surface hover:text-primary"
            >
              {product.name}
            </Link>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              {product.category}
              {product.sku && ` · ${product.sku}`}
            </p>
          </div>
        </div>
      </td>

      <td className="py-4 pr-4">
        <PriceEditor productId={product.id} price={product.price} />
      </td>

      <td className="py-4 pr-4">
        <span
          className={cn(
            "font-body-md text-body-md",
            product.totalStock <= 0
              ? "text-error"
              : product.totalStock <= 10
                ? "text-tertiary"
                : "text-on-surface"
          )}
        >
          {product.totalStock}
        </span>
        <span className="font-body-sm text-[12px] text-on-surface-variant">
          {" "}
          / {product.variantCount} varyant
        </span>
      </td>

      <td className="py-4 pr-4">
        <div className="flex items-center gap-4">
          <ToggleSwitch
            checked={product.featured}
            label="Öne çıkan"
            onToggle={(next) => updateProductFlags(product.id, { featured: next })}
          />
          <ToggleSwitch
            checked={product.bestSeller}
            label="Çok satan"
            onToggle={(next) => updateProductFlags(product.id, { bestSeller: next })}
          />
          <ToggleSwitch
            checked={product.newArrival}
            label="Yeni gelen"
            onToggle={(next) => updateProductFlags(product.id, { newArrival: next })}
          />
        </div>
      </td>

      <td className="py-4 pr-4">
        <ToggleSwitch
          checked={product.active}
          label="Satışta"
          onToggle={(next) => toggleProductActive(product.id, next)}
        />
      </td>

      <td className="py-4">
        <Link
          href={`/admin/urunler/${product.id}`}
          className="inline-flex items-center gap-1 font-label-caps text-label-caps uppercase text-primary hover:underline"
        >
          <Icon name="edit" className="text-[16px]" />
          Düzenle
        </Link>
      </td>
    </tr>
  );
}

export default ProductRow;
