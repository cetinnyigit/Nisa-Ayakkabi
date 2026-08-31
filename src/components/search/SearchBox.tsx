"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/arama?q=${encodeURIComponent(q)}` : "/arama");
  }

  return (
    <form onSubmit={submit} className="relative mx-auto max-w-xl">
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
      />
      <input
        autoFocus
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ürün, kategori veya malzeme arayın…"
        aria-label="Arama"
        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-4 pl-14 pr-28 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-4 focus:ring-primary-fixed/40"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-tertiary px-5 py-2.5 font-label-caps text-label-caps uppercase text-on-tertiary transition-colors duration-300 hover:bg-on-tertiary-fixed-variant"
      >
        Ara
      </button>
    </form>
  );
}

export default SearchBox;
