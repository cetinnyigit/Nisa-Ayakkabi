"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

/**
 * İyimser anahtar: tıklanınca hemen değişir, sunucu reddederse geri alınır.
 */
export function ToggleSwitch({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: (next: boolean) => Promise<void>;
}) {
  const [value, setValue] = useState(checked);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !value;
    setValue(next);
    startTransition(async () => {
      try {
        await onToggle(next);
      } catch {
        setValue(!next);
      }
    });
  }

  return (
    <button
      // Form içinde de kullanılıyor; type verilmezse tıklama formu gönderir.
      type="button"
      onClick={toggle}
      disabled={pending}
      role="switch"
      aria-checked={value}
      aria-label={label}
      title={label}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-50",
        value ? "bg-success" : "bg-error"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-surface-container-lowest transition-transform duration-300",
          value ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default ToggleSwitch;
