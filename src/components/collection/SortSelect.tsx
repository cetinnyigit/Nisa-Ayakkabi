"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "en-yeni", label: "En Yeni" },
  { value: "fiyat-artan", label: "Fiyat: Düşükten Yükseğe" },
  { value: "fiyat-azalan", label: "Fiyat: Yüksekten Düşüğe" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-3">
      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
        Sırala:
      </span>
      <select
        value={searchParams.get("sirala") ?? "en-yeni"}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sirala", e.target.value);
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        className="cursor-pointer border-none bg-transparent p-0 pr-6 font-label-caps text-label-caps uppercase text-on-surface transition-colors hover:text-primary focus:ring-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortSelect;
