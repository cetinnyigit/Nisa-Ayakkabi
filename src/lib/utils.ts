import type { Decimal } from "@prisma/client/runtime/library";

/** Koşullu className birleştirici. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Prisma Decimal | number | string → number */
export function toNumber(value: Decimal | number | string): number {
  return typeof value === "number" ? value : Number(value);
}

// ₺ sembolü yerine "TL" soneki kullanılıyor; tam sayı tutarlarda kuruş gizlenir.
const wholeFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const fractionFormatter = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 2850 → "2.850 TL" · 2499.9 → "2.499,90 TL" */
export function formatPrice(value: Decimal | number | string): string {
  const amount = toNumber(value);
  const formatter = Number.isInteger(amount) ? wholeFormatter : fractionFormatter;
  return `${formatter.format(amount)} TL`;
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** 2026-08-27 → "27 Ağustos 2026" */
export function formatDate(value: Date | string): string {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

/** "Kadın Ayakkabı" → "kadin-ayakkabi" (Türkçe karakter duyarlı) */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return input
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => map[ch] ?? ch)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
