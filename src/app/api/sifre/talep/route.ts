import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { TOKEN_TTL_MINUTES, createResetRequest } from "@/lib/password-reset";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

/**
 * Şifre sıfırlama talebi.
 *
 * Hesap sayımını (account enumeration) engellemek için sonuç ne olursa olsun
 * AYNI yanıt döner: e-posta kayıtlı değilse de, hesabın şifresi yoksa da,
 * bekleme süresi dolmadıysa da. Ayrıntı yalnızca sunucu günlüğüne yazılır.
 */
const GENERIC_RESPONSE = {
  ok: true,
  message:
    "Bu adres kayıtlıysa şifre sıfırlama bağlantısını e-posta ile gönderdik. " +
    "Gelen kutunuzu ve spam klasörünü kontrol edin.",
};

export async function POST(request: Request) {
  // Hesap başına bekleme süresi zaten var; bu, IP başına toplu denemeyi engeller.
  const limit = rateLimit(`sifre:${clientIp(request)}`, 10, 3600);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let email: string | undefined;
  try {
    ({ email } = (await request.json()) as { email?: string });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin.", field: "email" },
      { status: 422 }
    );
  }

  try {
    const result = await createResetRequest(email);

    if (result.status === "created") {
      await sendPasswordResetEmail(email.toLowerCase().trim(), result.token, TOKEN_TTL_MINUTES);
    } else {
      console.info(`Şifre sıfırlama talebi işlenmedi (${result.status}).`);
    }
  } catch (error) {
    // Hata da sızdırılmaz; kullanıcı yine aynı mesajı görür.
    console.error("Şifre sıfırlama talebi başarısız:", error);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
