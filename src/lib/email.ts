import { Resend } from "resend";
import { company, formatAddress } from "@/lib/company";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { formatPrice, toNumber } from "@/lib/utils";

/**
 * Sipariş e-postaları. RESEND_API_KEY tanımlı değilse sessizce atlanır —
 * e-posta gönderilememesi siparişi bozmamalı.
 */

const FROM = process.env.ORDER_EMAIL_FROM || "Nisa Ayakkabı <siparis@nisayakkabi.com>";

/**
 * Gönderim adresinin gelen kutusu yok (Resend yalnızca gönderim yapar).
 * Müşteri "yanıtla" derse mail gerçek destek adresine düşsün.
 */
const REPLY_TO = company.supportEmail;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}


function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type EmailResult = { sent: boolean; reason?: string };

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  ttlMinutes: number
): Promise<EmailResult> {
  const link = `${siteUrl()}/sifre-sifirla?token=${encodeURIComponent(token)}`;

  if (!isEmailConfigured()) {
    // E-posta yapılandırılmadan geliştirme yapılabilsin diye bağlantı loglanır.
    // Üretimde RESEND_API_KEY tanımlı olacağı için bu dal çalışmaz.
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[şifre sıfırlama] ${to} için bağlantı:\n${link}\n`);
    }
    return { sent: false, reason: "not_configured" };
  }

  const html = `
<div style="background:#faf9f6;padding:40px 20px;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px;">
    <h1 style="margin:0 0 8px;font-family:Georgia,'Playfair Display',serif;font-size:28px;font-weight:600;color:#755a25;letter-spacing:0.05em;">NISA</h1>
    <p style="margin:0 0 32px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4d463a;">Şifre Sıfırlama</p>

    <h2 style="margin:0 0 16px;font-family:Georgia,'Playfair Display',serif;font-size:24px;font-weight:500;color:#1a1c1a;">Şifrenizi mi unuttunuz?</h2>
    <p style="margin:0 0 32px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:1.6;color:#4d463a;">
      Aşağıdaki bağlantıya tıklayarak yeni bir şifre belirleyebilirsiniz.
      Bu bağlantı <strong>${ttlMinutes} dakika</strong> boyunca geçerlidir ve yalnızca bir kez kullanılabilir.
    </p>

    <p style="margin:0 0 32px;text-align:center;">
      <a href="${link}"
         style="display:inline-block;background:#705a49;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">
        Yeni Şifre Belirle
      </a>
    </p>

    <p style="margin:0 0 8px;font-family:Montserrat,Arial,sans-serif;font-size:12px;color:#7f7668;">
      Bağlantı çalışmazsa bu adresi tarayıcınıza yapıştırın:
    </p>
    <p style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:12px;color:#755a25;word-break:break-all;">
      ${link}
    </p>

    <p style="margin:32px 0 0;padding-top:24px;border-top:1px solid #d1c5b5;font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:1.6;color:#7f7668;">
      Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz — şifreniz değişmez.
    </p>
  </div>
</div>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: "Şifre sıfırlama bağlantınız",
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("Şifre sıfırlama e-postası gönderilemedi:", error);
    return { sent: false, reason: "send_failed" };
  }
}

function loadOrderForEmail(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      address: true,
      user: { select: { email: true, name: true } },
      items: {
        include: {
          product: { select: { name: true } },
          variant: { select: { size: true, color: true } },
        },
      },
    },
  });
}

type OrderForEmail = NonNullable<Awaited<ReturnType<typeof loadOrderForEmail>>>;

/** Ürün satırları + ara toplam/kargo/toplam — müşteri ve satıcı e-postası aynı tabloyu kullanır. */
function orderItemsHtml(order: OrderForEmail): string {
  const rows = order.items
    .map((item) => {
      const variant = item.variant ? ` (${item.variant.color} / ${item.variant.size})` : "";
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #d1c5b5;font-family:Montserrat,Arial,sans-serif;font-size:14px;color:#1a1c1a;">
            ${escapeHtml(item.product.name)}${escapeHtml(variant)}<br>
            <span style="color:#4d463a;">${item.quantity} adet</span>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #d1c5b5;font-family:Montserrat,Arial,sans-serif;font-size:14px;color:#1a1c1a;">
            ${formatPrice(toNumber(item.price) * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");

  const shipping = toNumber(order.shippingCost);

  return `
    <table style="width:100%;border-collapse:collapse;">${rows}</table>

    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <tr>
        <td style="padding:4px 0;font-family:Montserrat,Arial,sans-serif;font-size:14px;color:#4d463a;">Ara Toplam</td>
        <td align="right" style="padding:4px 0;font-family:Montserrat,Arial,sans-serif;font-size:14px;color:#1a1c1a;">${formatPrice(toNumber(order.subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-family:Montserrat,Arial,sans-serif;font-size:14px;color:#4d463a;">Kargo</td>
        <td align="right" style="padding:4px 0;font-family:Montserrat,Arial,sans-serif;font-size:14px;color:#1a1c1a;">${shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-family:Georgia,'Playfair Display',serif;font-size:18px;color:#1a1c1a;">Toplam</td>
        <td align="right" style="padding:12px 0 0;font-family:Georgia,'Playfair Display',serif;font-size:18px;color:#755a25;">${formatPrice(toNumber(order.total))}</td>
      </tr>
    </table>`;
}

/** Teslimat adresi: ad soyad, adres, ilçe/il, telefon. */
function addressHtml(order: OrderForEmail): string {
  const { address } = order;
  return `
        ${escapeHtml(address.firstName)} ${escapeHtml(address.lastName)}<br>
        ${escapeHtml(address.address)}<br>
        ${address.district ? escapeHtml(address.district) + ", " : ""}${escapeHtml(address.city)} ${escapeHtml(address.postalCode)}<br>
        ${escapeHtml(address.phone)}`;
}

export async function sendOrderConfirmation(orderNumber: string): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "not_configured" };
  }

  const order = await loadOrderForEmail(orderNumber);
  if (!order) return { sent: false, reason: "order_not_found" };

  const to = order.user?.email ?? order.guestEmail;
  if (!to) return { sent: false, reason: "no_recipient" };

  const customerName = order.user?.name ?? order.guestName ?? order.address.firstName;

  const html = `
<div style="background:#faf9f6;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px;">
    <h1 style="margin:0 0 8px;font-family:Georgia,'Playfair Display',serif;font-size:28px;font-weight:600;color:#755a25;letter-spacing:0.05em;">NISA</h1>
    <p style="margin:0 0 32px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4d463a;">Sipariş Onayı</p>

    <h2 style="margin:0 0 16px;font-family:Georgia,'Playfair Display',serif;font-size:24px;font-weight:500;color:#1a1c1a;">Teşekkür ederiz, ${escapeHtml(customerName)}.</h2>
    <p style="margin:0 0 32px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:1.6;color:#4d463a;">
      Siparişiniz alındı ve hazırlanmaya başlandı. Kargoya verildiğinde sizi tekrar bilgilendireceğiz.
    </p>

    <div style="background:#f4f3f1;border-radius:8px;padding:16px;margin-bottom:32px;">
      <p style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4d463a;">Sipariş No</p>
      <p style="margin:4px 0 0;font-family:Georgia,'Playfair Display',serif;font-size:20px;color:#1a1c1a;">${escapeHtml(order.orderNumber)}</p>
    </div>

    ${orderItemsHtml(order)}

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #d1c5b5;">
      <p style="margin:0 0 8px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4d463a;">Teslimat Adresi</p>
      <p style="margin:0;font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1c1a;">
        ${addressHtml(order)}
      </p>
    </div>

    <p style="margin:32px 0 0;text-align:center;">
      <a href="${siteUrl()}/siparis/${encodeURIComponent(order.orderNumber)}"
         style="display:inline-block;background:#705a49;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">
        Siparişimi Görüntüle
      </a>
    </p>

    <p style="margin:32px 0 0;font-family:Montserrat,Arial,sans-serif;font-size:12px;line-height:1.6;color:#7f7668;text-align:center;">
      ${escapeHtml(company.legalName)} · ${escapeHtml(company.brandName)}<br>
      ${escapeHtml(formatAddress())}<br>
      ${escapeHtml(company.phone)} · ${escapeHtml(company.email)}<br><br>
      Sorularınız için bu e-postayı yanıtlayabilirsiniz.
    </p>
  </div>
</div>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `Siparişiniz alındı — ${order.orderNumber}`,
      html,
    });
    return { sent: true };
  } catch (error) {
    // E-posta gönderilemedi diye ödeme akışı bozulmamalı; yalnızca logla.
    console.error("Sipariş e-postası gönderilemedi:", error);
    return { sent: false, reason: "send_failed" };
  }
}

/**
 * Satıcıya "yeni sipariş" bildirimi — ödeme onaylandığında company.orderNotificationEmail
 * adresine gider. Yanıtla denirse müşteriye yazılır.
 */
export async function sendNewOrderNotification(orderNumber: string): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    return { sent: false, reason: "not_configured" };
  }

  const order = await loadOrderForEmail(orderNumber);
  if (!order) return { sent: false, reason: "order_not_found" };

  const customerEmail = order.user?.email ?? order.guestEmail;
  const customerName =
    order.user?.name ??
    order.guestName ??
    `${order.address.firstName} ${order.address.lastName}`;
  const customerPhone = order.guestPhone ?? order.address.phone;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const createdAt = order.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const label =
    "margin:0 0 4px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4d463a;";
  const value = "margin:0 0 16px;font-family:Montserrat,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1c1a;";

  const html = `
<div style="background:#faf9f6;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px;">
    <h1 style="margin:0 0 8px;font-family:Georgia,'Playfair Display',serif;font-size:28px;font-weight:600;color:#755a25;letter-spacing:0.05em;">NISA</h1>
    <p style="margin:0 0 32px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#4d463a;">Yeni Sipariş</p>

    <h2 style="margin:0 0 8px;font-family:Georgia,'Playfair Display',serif;font-size:24px;font-weight:500;color:#1a1c1a;">
      ${formatPrice(toNumber(order.total))} tutarında yeni sipariş
    </h2>
    <p style="margin:0 0 32px;font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:1.6;color:#4d463a;">
      Ödeme onaylandı · ${itemCount} ürün · ${escapeHtml(createdAt)}
    </p>

    <div style="background:#f4f3f1;border-radius:8px;padding:16px;margin-bottom:32px;">
      <p style="${label}">Sipariş No</p>
      <p style="margin:4px 0 0;font-family:Georgia,'Playfair Display',serif;font-size:20px;color:#1a1c1a;">${escapeHtml(order.orderNumber)}</p>
    </div>

    <p style="${label}">Müşteri</p>
    <p style="${value}">
      ${escapeHtml(customerName)}<br>
      ${customerEmail ? `<a href="mailto:${escapeHtml(customerEmail)}" style="color:#755a25;">${escapeHtml(customerEmail)}</a><br>` : ""}
      ${customerPhone ? `<a href="tel:${escapeHtml(customerPhone)}" style="color:#755a25;">${escapeHtml(customerPhone)}</a>` : ""}
      ${order.user ? "" : "<br><span style=\"color:#7f7668;\">Üye olmadan sipariş verdi</span>"}
    </p>

    <p style="${label}">Teslimat Adresi</p>
    <p style="${value}">
      ${addressHtml(order)}
    </p>

    ${order.note ? `<p style="${label}">Sipariş Notu</p><p style="${value}">${escapeHtml(order.note)}</p>` : ""}

    <div style="margin-top:8px;">
      ${orderItemsHtml(order)}
    </div>

    <p style="margin:32px 0 0;text-align:center;">
      <a href="${siteUrl()}/admin/siparisler#${encodeURIComponent(order.orderNumber)}"
         style="display:inline-block;background:#705a49;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-family:Montserrat,Arial,sans-serif;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">
        Yönetim Panelinde Aç
      </a>
    </p>
  </div>
</div>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: company.orderNotificationEmail,
      ...(customerEmail ? { replyTo: customerEmail } : {}),
      subject: `Yeni sipariş: ${order.orderNumber} — ${formatPrice(toNumber(order.total))}`,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("Yeni sipariş bildirimi gönderilemedi:", error);
    return { sent: false, reason: "send_failed" };
  }
}
