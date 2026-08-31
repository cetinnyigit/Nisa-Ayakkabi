"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ChipProps = {
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "disabled">;

/** Numara / genel seçim çipi. Seçili durum ağır dolgu değil, hafif altın tint + 1px çerçeve. */
export function Chip({ selected = false, disabled = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "min-w-[48px] rounded-lg border px-4 py-2 font-body-sm text-body-sm",
        "transition-colors duration-300",
        selected
          ? "border-primary bg-primary-fixed/40 text-on-primary-container"
          : "border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-on-surface",
        disabled && "cursor-not-allowed text-on-surface-variant/40 line-through hover:border-outline-variant",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

type ColorChipProps = {
  color: string;
  hex?: string | null;
  selected?: boolean;
  onClick?: () => void;
};

/** Renk seçimi çipi — dolgu yerine ince halka ile seçili durum. */
export function ColorChip({ color, hex, selected = false, onClick }: ColorChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={color}
      aria-pressed={selected}
      title={color}
      className={cn(
        "h-9 w-9 rounded-full border transition-shadow duration-300",
        selected
          ? "border-primary ring-2 ring-primary-fixed ring-offset-2 ring-offset-background"
          : "border-outline-variant hover:ring-2 hover:ring-primary-fixed/50 hover:ring-offset-2 hover:ring-offset-background"
      )}
      style={{ backgroundColor: hex ?? "#e3e2e0" }}
    />
  );
}

export default Chip;
