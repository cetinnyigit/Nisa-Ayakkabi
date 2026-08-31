"use client";

import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { useState, useTransition } from "react";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { updateCategoryPositions, updateCategoryVisibility } from "@/app/admin/actions";

export type AdminCategory = {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  image: string | null;
  showInNav: boolean;
  navPosition: number;
  showOnHome: boolean;
  homePosition: number;
  productCount: number;
};

function PositionInput({
  categoryId,
  field,
  value,
}: {
  categoryId: string;
  field: "navPosition" | "homePosition";
  value: number;
}) {
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function save(next: number) {
    if (!Number.isInteger(next) || next < 0) return;
    const previous = current;
    setCurrent(next);
    setError(false);
    startTransition(async () => {
      try {
        await updateCategoryPositions(categoryId, { [field]: next });
      } catch {
        setCurrent(previous);
        setError(true);
      }
    });
  }

  return (
    <input
      type="number"
      min={0}
      value={current}
      disabled={pending}
      onChange={(e) => setCurrent(Number(e.target.value))}
      onBlur={(e) => save(Number(e.target.value))}
      className={`w-16 rounded border bg-surface-container-lowest px-2 py-1 font-body-sm text-body-sm focus:ring-0 ${
        error ? "border-error" : "border-outline-variant focus:border-primary"
      }`}
    />
  );
}

export function CategoryRow({ category }: { category: AdminCategory }) {
  return (
    <tr className="border-b border-outline-variant/20 last:border-0">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-container">
            {category.image && (
              <SafeImage src={category.image} alt="" fill sizes="48px" className="object-cover" />
            )}
          </div>
          <div>
            <Link
              href={`/koleksiyon/${category.slug}`}
              className="font-body-md text-body-md text-on-surface hover:text-primary"
            >
              {category.name}
            </Link>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              {category.nameEn} · /{category.slug}
            </p>
          </div>
        </div>
      </td>

      <td className="py-4 pr-4 font-body-md text-body-md text-on-surface-variant">
        {category.productCount}
      </td>

      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={category.showInNav}
            label="Menüde göster"
            onToggle={(next) => updateCategoryVisibility(category.id, { showInNav: next })}
          />
          <PositionInput categoryId={category.id} field="navPosition" value={category.navPosition} />
        </div>
      </td>

      <td className="py-4">
        <div className="flex items-center gap-3">
          <ToggleSwitch
            checked={category.showOnHome}
            label="Ana sayfada göster"
            onToggle={(next) => updateCategoryVisibility(category.id, { showOnHome: next })}
          />
          <PositionInput
            categoryId={category.id}
            field="homePosition"
            value={category.homePosition}
          />
        </div>
      </td>
    </tr>
  );
}

export default CategoryRow;
