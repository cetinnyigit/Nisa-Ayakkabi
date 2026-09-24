import { sendNewOrderNotification, sendOrderConfirmation } from "@/lib/email";
import { markOrderFailed, markOrderPaid } from "@/lib/orders";
import { PaytrNotConfiguredError, verifyCallbackHash } from "@/lib/paytr";

/**
 * PayTR bildirim (callback) adresi.
 * PayTR panelinde "Bildirim URL" olarak şu adres tanımlanmalı:
 *   https://<alan-adi>/api/odeme/paytr/callback
 *
 * PayTR, gövdede düz "OK" yanıtı bekler; aksi halde bildirimi tekrar tekrar gönderir.
 * Bu yüzden hata durumlarında bile 200 + "OK" dönmemeye dikkat edilmeli:
 * sadece işlemi gerçekten sonuçlandırdığımızda "OK" deriz.
 */
export async function POST(request: Request) {
  const form = await request.formData();

  const merchantOid = String(form.get("merchant_oid") ?? "");
  const status = String(form.get("status") ?? "");
  const totalAmount = String(form.get("total_amount") ?? "");
  const hash = String(form.get("hash") ?? "");

  if (!merchantOid || !status || !hash) {
    return new Response("PAYTR notification failed: missing fields", { status: 400 });
  }

  try {
    if (!verifyCallbackHash({ merchantOid, status, totalAmount, hash })) {
      // Doğrulanamayan bildirim işlenmez.
      return new Response("PAYTR notification failed: bad hash", { status: 400 });
    }
  } catch (error) {
    if (error instanceof PaytrNotConfiguredError) {
      console.error("PayTR callback geldi ama merchant bilgileri tanımlı değil.");
      return new Response("PAYTR notification failed: not configured", { status: 500 });
    }
    throw error;
  }

  try {
    if (status === "success") {
      const result = await markOrderPaid(merchantOid);
      if (!result.ok) {
        return new Response("PAYTR notification failed: order not found", { status: 404 });
      }
      // Müşteriye onay, satıcıya yeni sipariş bildirimi.
      // Yalnızca ilk onayda gönder — PayTR bildirimi tekrarlayabilir.
      // E-posta hatası bildirimi başarısız saymamalı, o yüzden await'i yutuyoruz.
      // merchantOid yeniden deneme sonrası sipariş numarasından farklı olabilir;
      // e-posta her zaman çözümlenen sipariş numarasıyla gönderilir.
      if (!result.alreadyPaid) {
        await Promise.all([
          sendOrderConfirmation(result.orderNumber).catch(() => undefined),
          sendNewOrderNotification(result.orderNumber).catch(() => undefined),
        ]);
      }
    } else {
      await markOrderFailed(merchantOid);
    }
  } catch (error) {
    console.error("PayTR callback işlenemedi:", error);
    return new Response("PAYTR notification failed", { status: 500 });
  }

  return new Response("OK");
}
