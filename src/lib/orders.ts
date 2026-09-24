import { prisma } from "@/lib/prisma";
import { calculateTotals } from "@/lib/shipping";
import { generateOrderNumber, nextPaymentOid } from "@/lib/paytr";
import { toNumber } from "@/lib/utils";

export type CartLineInput = { variantId: string; quantity: number };

export type CheckoutInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  district?: string;
  postalCode: string;
  note?: string;
  items: CartLineInput[];
  userId?: string | null;
};

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly field?: string
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

/** Tek siparişte kabul edilen en fazla farklı ürün satırı. */
export const MAX_CART_LINES = 50;
/** Tek satırda kabul edilen en fazla adet. */
export const MAX_LINE_QUANTITY = 20;

/**
 * Aynı varyantın birden çok satırda gelmesi stok kontrolünü delerdi
 * (her satır ayrı ayrı stokla karşılaştırılıyordu). Bu yüzden doğrulamadan
 * ÖNCE satırlar varyanta göre birleştirilir.
 */
function mergeLines(items: CartLineInput[]): CartLineInput[] {
  const merged = new Map<string, number>();
  for (const item of items) {
    if (typeof item?.variantId !== "string" || item.variantId.length === 0) {
      throw new CheckoutError("Sepetinizde geçersiz bir ürün var.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new CheckoutError("Geçersiz ürün adedi.");
    }
    merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.quantity);
  }
  return Array.from(merged, ([variantId, quantity]) => ({ variantId, quantity }));
}

/**
 * Sepet istemcide (localStorage) tutulduğu için fiyat ve stok ASLA istemciden
 * gelen değerlerle hesaplanmaz. Her satır veritabanından yeniden okunur.
 */
export async function priceCart(items: CartLineInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError("Sepetiniz boş.");
  }
  if (items.length > MAX_CART_LINES * 4) {
    // Birleştirmeden önceki kaba üst sınır — devasa gövdeleri erken reddeder.
    throw new CheckoutError("Sepetinizde çok fazla satır var.");
  }

  const cartLines = mergeLines(items);

  if (cartLines.length > MAX_CART_LINES) {
    throw new CheckoutError(
      `Tek siparişte en fazla ${MAX_CART_LINES} farklı ürün olabilir.`
    );
  }
  for (const line of cartLines) {
    if (line.quantity > MAX_LINE_QUANTITY) {
      throw new CheckoutError(
        `Bir üründen tek siparişte en fazla ${MAX_LINE_QUANTITY} adet alabilirsiniz.`
      );
    }
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: cartLines.map((i) => i.variantId) } },
    include: {
      product: { select: { id: true, name: true, price: true, active: true } },
    },
  });

  const lines = cartLines.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant || !variant.product.active) {
      throw new CheckoutError("Sepetinizdeki bir ürün artık satışta değil.");
    }
    // Stok negatife düşmüş olabilir; "< quantity" bunu da kapsar.
    if (variant.stock < item.quantity) {
      throw new CheckoutError(
        `${variant.product.name} (${variant.color} / ${variant.size}) için yeterli stok yok. ` +
          `Kalan: ${variant.stock} adet.`
      );
    }

    const unitPrice = variant.price != null ? toNumber(variant.price) : toNumber(variant.product.price);

    return {
      variantId: variant.id,
      productId: variant.product.id,
      name: `${variant.product.name} (${variant.color} / ${variant.size})`,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  return { lines, ...calculateTotals(subtotal) };
}

function requireField(value: string | undefined, field: string, label: string) {
  if (!value || value.trim().length === 0) {
    throw new CheckoutError(`${label} alanı zorunludur.`, field);
  }
  return value.trim();
}

export function validateCheckout(input: CheckoutInput) {
  const email = requireField(input.email, "email", "E-posta");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CheckoutError("Geçerli bir e-posta adresi girin.", "email");
  }

  const phone = requireField(input.phone, "phone", "Telefon").replace(/[\s()-]/g, "");
  if (!/^(\+90|0)?5\d{9}$/.test(phone)) {
    throw new CheckoutError("Geçerli bir cep telefonu girin (05XX XXX XX XX).", "phone");
  }

  const postalCode = requireField(input.postalCode, "postalCode", "Posta kodu");
  if (!/^\d{5}$/.test(postalCode)) {
    throw new CheckoutError("Posta kodu 5 haneli olmalıdır.", "postalCode");
  }

  return {
    email,
    phone,
    postalCode,
    firstName: requireField(input.firstName, "firstName", "Ad"),
    lastName: requireField(input.lastName, "lastName", "Soyad"),
    address: requireField(input.address, "address", "Adres"),
    addressLine2: input.addressLine2?.trim() || null,
    city: requireField(input.city, "city", "Şehir"),
    district: input.district?.trim() || null,
    note: input.note?.trim() || null,
  };
}

/**
 * Siparişi PENDING olarak oluşturur. Stok bu aşamada DÜŞÜLMEZ —
 * ödeme onayı (PayTR callback) geldiğinde düşülür.
 */
export async function createPendingOrder(input: CheckoutInput) {
  const fields = validateCheckout(input);
  const { lines, subtotal, shipping, total } = await priceCart(input.items);

  const fullAddress = [fields.address, fields.addressLine2].filter(Boolean).join(", ");

  const order = await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({
      data: {
        userId: input.userId ?? null,
        title: "Teslimat Adresi",
        firstName: fields.firstName,
        lastName: fields.lastName,
        phone: fields.phone,
        address: fullAddress,
        city: fields.city,
        district: fields.district,
        postalCode: fields.postalCode,
      },
    });

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: input.userId ?? null,
        // Formda yazılan e-posta üyelerde de saklanır: sipariş e-postaları bu adrese gider.
        guestEmail: fields.email,
        guestPhone: input.userId ? null : fields.phone,
        guestName: input.userId ? null : `${fields.firstName} ${fields.lastName}`,
        addressId: address.id,
        subtotal,
        shippingCost: shipping,
        total,
        note: fields.note,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            price: l.unitPrice,
          })),
        },
      },
      include: { address: true },
    });
  });

  return { order, lines, subtotal, shipping, total, email: fields.email };
}

/**
 * Bir ödeme denemesi için PayTR'ye gönderilecek merchant_oid'i hazırlar ve
 * siparişin `paymentId` alanına yazar. Callback bu alan üzerinden siparişi bulur.
 *
 * - İlk denemede oid = sipariş numarası.
 * - Önceki deneme başarısızsa PayTR eski oid'i kabul etmeyeceği için yeni bir
 *   oid üretilir ve sipariş yeniden "ödeme bekleniyor" durumuna alınır.
 * - Deneme hâlâ sürüyorsa (PENDING) mevcut oid tekrar kullanılır; böylece sayfa
 *   her yenilendiğinde yeni bir sipariş numarası üretilmez.
 */
export async function preparePaymentOid(order: {
  id: string;
  orderNumber: string;
  paymentId: string | null;
  paymentStatus: string;
}): Promise<string> {
  if (!order.paymentId) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: order.orderNumber },
    });
    return order.orderNumber;
  }

  if (order.paymentStatus === "FAILED") {
    const oid = nextPaymentOid(order.orderNumber, order.paymentId);
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: oid, paymentStatus: "PENDING" },
    });
    return oid;
  }

  return order.paymentId;
}

/**
 * Callback'ten gelen merchant_oid'e karşılık gelen siparişi bulur.
 * Önce güncel deneme numarası (`paymentId`), sonra sipariş numarası denenir —
 * ikincisi `paymentId` yazılmadan önce oluşmuş siparişler için geriye dönük destek.
 */
async function findOrderByPaymentOid(merchantOid: string) {
  return (
    (await prisma.order.findFirst({ where: { paymentId: merchantOid } })) ??
    (await prisma.order.findUnique({ where: { orderNumber: merchantOid } }))
  );
}

/**
 * Ödeme onaylandığında çağrılır: siparişi PAID yapar ve stokları düşer.
 * Aynı callback birden fazla kez gelebileceği için idempotent'tir.
 */
export async function markOrderPaid(merchantOid: string) {
  const found = await findOrderByPaymentOid(merchantOid);
  if (!found) return { ok: false as const, reason: "not_found" as const };

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: found.id },
      include: { items: true },
    });
    if (!order) return { ok: false as const, reason: "not_found" as const };
    if (order.paymentStatus === "PAID") {
      return { ok: true as const, alreadyPaid: true, orderNumber: order.orderNumber };
    }

    // Stok düşme KOŞULLU yapılır: `stock >= quantity` şartı sorgunun WHERE'ine
    // konur, böylece iki eş zamanlı ödeme aynı stoğu iki kez düşemez ve stok
    // hiçbir koşulda negatife inemez.
    const shortages: string[] = [];

    for (const item of order.items) {
      if (item.variantId) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          // Ödeme alındı ama stok yetmiyor. Parayı geri çeviremeyiz; siparişi
          // işaretleyip yöneticinin görmesini sağlıyoruz.
          shortages.push(item.variantId);
          continue;
        }
      }

      await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const note = shortages.length
      ? [order.note, `⚠ STOK YETERSİZ: ${shortages.length} kalem için stok düşülemedi. Manuel inceleme gerekiyor.`]
          .filter(Boolean)
          .join("\n")
      : order.note;

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        // Stok sorunu varsa otomatik olarak hazırlanmaya alınmaz.
        status: shortages.length ? "PENDING" : "PROCESSING",
        note,
      },
    });

    return {
      ok: true as const,
      alreadyPaid: false,
      shortages: shortages.length,
      orderNumber: order.orderNumber,
    };
  });
}

export async function markOrderFailed(merchantOid: string) {
  const order = await findOrderByPaymentOid(merchantOid);
  if (!order || order.paymentStatus === "PAID") return;

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "FAILED" },
  });
}
