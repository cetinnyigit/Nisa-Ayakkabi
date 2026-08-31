/** Mutlak adres üretmek gereken yerler (sitemap, robots, e-posta) için tek kaynak. */
export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
