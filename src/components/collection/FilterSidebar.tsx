"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn, formatPrice } from "@/lib/utils";

export type FilterOptions = {
  sizes: string[];
  colors: { name: string; hex: string | null }[];
  minPrice: number;
  maxPrice: number;
};

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-outline-variant/30 py-6 first:border-t-0 first:pt-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group mb-4 flex w-full items-center justify-between font-label-caps text-label-caps uppercase text-on-surface-variant"
      >
        {title}
        <Icon
          name={open ? "expand_less" : "expand_more"}
          className="text-[16px] transition-colors group-hover:text-primary"
        />
      </button>
      {open && children}
    </div>
  );
}

export function FilterSidebar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedSizes = searchParams.getAll("numara");
  const selectedColors = searchParams.getAll("renk");
  const maxPrice = Number(searchParams.get("max") ?? options.maxPrice);

  /** Bir filtre değerini açıp kapatır ve URL'i günceller. */
  const toggle = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll(key);
      params.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => params.append(key, v));
      params.delete("adet"); // filtre değişince sayfalama başa döner
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const setPrice = useCallback(
    (value: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value >= options.maxPrice) params.delete("max");
      else params.set("max", String(value));
      params.delete("adet");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, options.maxPrice]
  );

  const hasFilters = selectedSizes.length > 0 || selectedColors.length > 0 || searchParams.has("max");

  return (
    <div>
      <div className="mb-stack-sm flex items-center justify-between border-b border-outline-variant pb-4">
        <h2 className="font-label-caps text-label-caps uppercase text-on-surface">Filtreler</h2>
        {hasFilters && (
          <button
            onClick={() => router.push(pathname, { scroll: false })}
            className="font-label-caps text-label-caps uppercase text-primary transition-colors hover:text-on-surface"
          >
            Temizle
          </button>
        )}
      </div>

      <FilterGroup title="Numara">
        <div className="grid grid-cols-4 gap-2">
          {options.sizes.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggle("numara", size)}
                aria-pressed={active}
                className={cn(
                  "flex h-10 items-center justify-center rounded border font-body-sm text-body-sm transition-colors duration-300",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-outline-variant text-on-surface hover:border-primary hover:text-primary"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Renk">
        <div className="flex flex-wrap gap-3">
          {options.colors.map((color) => {
            const active = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => toggle("renk", color.name)}
                aria-label={color.name}
                aria-pressed={active}
                title={color.name}
                className={cn(
                  "h-6 w-6 rounded-full border border-outline-variant transition-transform duration-300 hover:scale-110",
                  active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                style={{ backgroundColor: color.hex ?? "#e3e2e0" }}
              />
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Fiyat">
        <div className="space-y-4">
          <input
            type="range"
            min={options.minPrice}
            max={options.maxPrice}
            step={50}
            defaultValue={maxPrice}
            onMouseUp={(e) => setPrice(Number(e.currentTarget.value))}
            onTouchEnd={(e) => setPrice(Number(e.currentTarget.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-surface-variant accent-primary"
          />
          <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>{formatPrice(options.minPrice)}</span>
            <span>{formatPrice(maxPrice)}</span>
          </div>
        </div>
      </FilterGroup>
    </div>
  );
}

export default FilterSidebar;
