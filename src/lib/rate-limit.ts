/**
 * Basit, süreç içi hız sınırlayıcı.
 *
 * SINIRI: Bellekte tutulur; birden fazla sunucu örneği çalıştığında her örnek
 * kendi sayacını tutar. Kaba kuvvet ve kazara sel için yeterli, kararlı bir
 * kota mekanizması değil. Ölçeklenince Upstash/Redis tabanlı bir sınırlayıcıya
 * geçilmelidir.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bellek sızıntısını önlemek için süresi dolan kayıtlar periyodik temizlenir.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  // tsconfig target ES5 olduğu için Map doğrudan iterate edilemiyor.
  const expired: string[] = [];
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) expired.push(key);
  });
  expired.forEach((key) => buckets.delete(key));
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

/** İstek sahibinin IP'si (ters vekil arkasında x-forwarded-for). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "bilinmeyen";
}

/** 429 yanıtı üretir. */
export function tooManyRequests(retryAfterSeconds: number) {
  return Response.json(
    {
      error: `Çok fazla istek gönderdiniz. Lütfen ${retryAfterSeconds} saniye sonra tekrar deneyin.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
