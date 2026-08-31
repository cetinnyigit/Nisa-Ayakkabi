"use client";

import { useState } from "react";
import FilterSidebar, { type FilterOptions } from "./FilterSidebar";
import { Icon } from "@/components/ui/Icon";

/** Mobilde filtreleri açan buton + alttan gelen panel. */
export function MobileFilters({ options }: { options: FilterOptions }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface"
      >
        <Icon name="tune" className="text-[18px]" />
        Filtreler
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl bg-surface p-margin-mobile">
            <div className="mb-stack-sm flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">Filtreler</span>
              <button onClick={() => setOpen(false)} aria-label="Kapat" className="text-primary">
                <Icon name="close" />
              </button>
            </div>
            <FilterSidebar options={options} />
          </div>
        </div>
      )}
    </>
  );
}

export default MobileFilters;
