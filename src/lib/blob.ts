/**
 * Vercel Blob yapılandırılmış mı? Yeni Blob depoları BLOB_STORE_ID + OIDC ile çalışır
 * (Vercel'de VERCEL_OIDC_TOKEN otomatik gelir); eski depolar BLOB_READ_WRITE_TOKEN kullanır.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}
