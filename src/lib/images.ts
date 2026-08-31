/**
 * next/image yalnızca next.config.mjs'te tanımlı host'ları kabul eder; başka bir
 * host'tan görsel verilirse SAYFA TAMAMEN ÇÖKER (500). Yönetici panelinden
 * elle görsel adresi girilebildiği için bu liste iki yerde kullanılır:
 *
 *  1. Giriş anında doğrulama (yanlış adres hiç kaydedilmesin)
 *  2. Render anında kontrol (veritabanında zaten duran hatalı kayıt sayfayı çökertmesin)
 *
 * next.config.mjs'teki remotePatterns ile AYNI tutulmalıdır.
 */
export const ALLOWED_IMAGE_HOSTS = [
  { suffix: ".public.blob.vercel-storage.com", label: "Vercel Blob" },
  { suffix: "lh3.googleusercontent.com", label: "Google (Stitch mockup)" },
  { suffix: "images.unsplash.com", label: "Unsplash" },
] as const;

export function isAllowedImageHost(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;

  return ALLOWED_IMAGE_HOSTS.some(
    ({ suffix }) => parsed.hostname === suffix || parsed.hostname.endsWith(suffix)
  );
}

export function allowedHostsMessage(): string {
  return ALLOWED_IMAGE_HOSTS.map((h) => `${h.label} (${h.suffix})`).join(", ");
}
