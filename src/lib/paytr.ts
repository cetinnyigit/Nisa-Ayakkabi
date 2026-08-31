import crypto from "crypto";

/**
 * PayTR iFrame API.
 * Kart bilgisi hiçbir zaman bizim sunucumuzdan geçmez; kullanıcı PayTR'nin
 * iframe'ine bilgi girer. Biz sadece token alır ve callback'i doğrularız.
 */

export type PaytrConfig = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
};

export class PaytrNotConfiguredError extends Error {
  constructor() {
    super("PayTR bilgileri tanımlı değil (PAYTR_MERCHANT_ID / _KEY / _SALT).");
    this.name = "PaytrNotConfiguredError";
  }
}

export function getPaytrConfig(): PaytrConfig {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchantId || !merchantKey || !merchantSalt) throw new PaytrNotConfiguredError();

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode: process.env.PAYTR_TEST_MODE !== "0",
  };
}

export function isPaytrConfigured(): boolean {
  return Boolean(
    process.env.PAYTR_MERCHANT_ID &&
      process.env.PAYTR_MERCHANT_KEY &&
      process.env.PAYTR_MERCHANT_SALT
  );
}

function hmacBase64(value: string, key: string): string {
  return crypto.createHmac("sha256", key).update(value).digest("base64");
}

export type BasketLine = { name: string; price: number; quantity: number };

export type TokenRequest = {
  orderNumber: string;
  email: string;
  /** TL cinsinden toplam; kuruşa burada çevrilir */
  amount: number;
  userName: string;
  userAddress: string;
  userPhone: string;
  userIp: string;
  basket: BasketLine[];
  okUrl: string;
  failUrl: string;
};

/**
 * PayTR'den ödeme token'ı alır. Dönen token ile
 * https://www.paytr.com/odeme/guest/{token} iframe'de açılır.
 */
export async function createPaytrToken(req: TokenRequest): Promise<string> {
  const config = getPaytrConfig();

  // PayTR tutarı kuruş olarak ister
  const paymentAmount = Math.round(req.amount * 100).toString();

  // [ [ürün adı, birim fiyat (string), adet], ... ] → JSON → base64
  const basketPayload = req.basket.map((line) => [
    line.name,
    line.price.toFixed(2),
    line.quantity,
  ]);
  const userBasket = Buffer.from(JSON.stringify(basketPayload)).toString("base64");

  const noInstallment = "0";
  const maxInstallment = "0";
  const currency = "TL";
  const testMode = config.testMode ? "1" : "0";

  const hashStr =
    config.merchantId +
    req.userIp +
    req.orderNumber +
    req.email +
    paymentAmount +
    userBasket +
    noInstallment +
    maxInstallment +
    currency +
    testMode;

  const paytrToken = hmacBase64(hashStr + config.merchantSalt, config.merchantKey);

  const body = new URLSearchParams({
    merchant_id: config.merchantId,
    user_ip: req.userIp,
    merchant_oid: req.orderNumber,
    email: req.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: config.testMode ? "1" : "0",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: req.userName,
    user_address: req.userAddress,
    user_phone: req.userPhone,
    merchant_ok_url: req.okUrl,
    merchant_fail_url: req.failUrl,
    timeout_limit: "30",
    currency,
    test_mode: testMode,
  });

  const res = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayTR token isteği başarısız (HTTP ${res.status})`);
  }

  const data = (await res.json()) as { status: string; token?: string; reason?: string };
  if (data.status !== "success" || !data.token) {
    throw new Error(`PayTR token alınamadı: ${data.reason ?? "bilinmeyen hata"}`);
  }

  return data.token;
}

/**
 * Callback bildiriminin gerçekten PayTR'den geldiğini doğrular.
 * Doğrulanmayan istekler kesinlikle işlenmemelidir.
 */
export function verifyCallbackHash(params: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}): boolean {
  const config = getPaytrConfig();
  const expected = hmacBase64(
    params.merchantOid + config.merchantSalt + params.status + params.totalAmount,
    config.merchantKey
  );

  const a = Buffer.from(expected);
  const b = Buffer.from(params.hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** PayTR merchant_oid yalnızca harf/rakam kabul eder. */
export function generateOrderNumber(): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NSA${time}${random}`;
}
