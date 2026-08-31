import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

/** Panelde stok uyarısı bu eşiğin altında gösterilir. */
export const LOW_STOCK_THRESHOLD = 3;

export async function getDashboardStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [revenue, monthRevenue, pendingOrders, totalOrders, productCount, lowStockCount] =
    await Promise.all([
      // Ciro yalnızca ödemesi alınmış siparişlerden sayılır
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
      prisma.order.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.productVariant.count({
        where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { active: true } },
      }),
    ]);

  return {
    revenue: revenue._sum.total ? toNumber(revenue._sum.total) : 0,
    monthRevenue: monthRevenue._sum.total ? toNumber(monthRevenue._sum.total) : 0,
    pendingOrders,
    totalOrders,
    productCount,
    lowStockCount,
  };
}

/**
 * Bir tarihi YEREL güne göre "YYYY-MM-DD" anahtarına çevirir.
 * `toISOString()` kullanılamaz: UTC'ye çevirdiği için UTC+3'te yerel gece yarısı
 * bir önceki güne kayar ve bugünün siparişleri grafiğin dışında kalır.
 */
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Son N günün günlük cirosu. Sipariş olmayan günler 0 olarak doldurulur ki
 * grafik gerçek zaman aralığını gösterebilsin.
 */
export async function getSalesSeries(days = 14) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const orders = await prisma.order.findMany({
    where: { paymentStatus: "PAID", createdAt: { gte: start } },
    select: { createdAt: true, total: true },
  });

  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(localDateKey(d), { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const bucket = buckets.get(localDateKey(order.createdAt));
    if (bucket) {
      bucket.revenue += toNumber(order.total);
      bucket.orders += 1;
    }
  }

  return Array.from(buckets, ([date, value]) => ({ date, ...value }));
}

export async function getRecentOrders(limit = 6) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      address: { select: { firstName: true, lastName: true } },
      items: { select: { quantity: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: `${o.address.firstName} ${o.address.lastName}`,
    itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    total: toNumber(o.total),
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
  }));
}

export async function getLowStockVariants(limit = 8) {
  const variants = await prisma.productVariant.findMany({
    where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { active: true } },
    orderBy: { stock: "asc" },
    take: limit,
    include: { product: { select: { name: true, slug: true } } },
  });

  return variants.map((v) => ({
    id: v.id,
    productName: v.product.name,
    slug: v.product.slug,
    size: v.size,
    color: v.color,
    stock: v.stock,
  }));
}

/** Sipariş listesinde bir sayfada gösterilen sipariş sayısı. */
export const ORDERS_PAGE_SIZE = 20;
/** Bir siparişte listelenen en fazla kalem; gerisi "…ve N kalem daha" olur. */
export const ORDER_ITEMS_PREVIEW = 10;

export async function getAdminOrders(status?: string, page = 1) {
  const where = status ? { status: status as never } : undefined;
  const total = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ORDERS_PAGE_SIZE,
    take: ORDERS_PAGE_SIZE,
    include: {
      address: true,
      // Devasa siparişler sayfayı kilitlemesin diye kalemler sınırlı çekilir.
      items: {
        take: ORDER_ITEMS_PREVIEW,
        include: {
          product: { select: { name: true } },
          variant: { select: { size: true, color: true } },
        },
      },
      _count: { select: { items: true } },
    },
  });

  return {
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: `${o.address.firstName} ${o.address.lastName}`,
      email: o.guestEmail,
      phone: o.address.phone,
      city: o.address.city,
      total: toNumber(o.total),
      status: o.status,
      paymentStatus: o.paymentStatus,
      note: o.note,
      createdAt: o.createdAt,
      itemCount: o._count.items,
      hiddenItemCount: Math.max(0, o._count.items - o.items.length),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.product.name,
        variant: i.variant ? `${i.variant.color} / ${i.variant.size}` : null,
        quantity: i.quantity,
        price: toNumber(i.price),
      })),
    })),
  };
}

export async function getAdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
      variants: { select: { stock: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category.name,
    price: toNumber(p.price),
    comparePrice: p.comparePrice == null ? null : toNumber(p.comparePrice),
    image: p.images[0]?.url ?? null,
    active: p.active,
    featured: p.featured,
    bestSeller: p.bestSeller,
    newArrival: p.newArrival,
    totalStock: p.variants.reduce((n, v) => n + v.stock, 0),
    variantCount: p.variants.length,
  }));
}

export async function getAdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { navPosition: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    nameEn: c.nameEn,
    slug: c.slug,
    image: c.image,
    showInNav: c.showInNav,
    navPosition: c.navPosition,
    showOnHome: c.showOnHome,
    homePosition: c.homePosition,
    productCount: c._count.products,
  }));
}
