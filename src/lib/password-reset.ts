import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/** Bağlantının geçerlilik süresi. */
export const TOKEN_TTL_MINUTES = 60;

/** Aynı hesap için art arda talep engeli (e-posta bombardımanına karşı). */
const REQUEST_COOLDOWN_SECONDS = 60;

/** Aynı hesap için aynı anda açık kalabilecek en fazla bağlantı sayısı. */
const MAX_ACTIVE_TOKENS = 3;

/**
 * Token yalnızca e-postayla kullanıcıya gider; veritabanında SHA-256 özeti
 * saklanır. Böylece veritabanı sızsa bile bağlantılar kullanılamaz.
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type ResetRequestResult =
  | { status: "created"; token: string; userId: string }
  | { status: "no_user" }
  | { status: "no_password" }
  | { status: "cooldown" };

/**
 * Sıfırlama talebi oluşturur.
 *
 * Çağıran taraf sonucu KULLANICIYA YANSITMAMALIDIR: hangi e-postanın kayıtlı
 * olduğunu sızdırmamak için her durumda aynı mesaj gösterilir.
 */
export async function createResetRequest(email: string): Promise<ResetRequestResult> {
  const normalized = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, password: true },
  });

  if (!user) return { status: "no_user" };
  // Yalnızca OAuth ile açılmış hesabın sıfırlanacak şifresi yoktur.
  if (!user.password) return { status: "no_password" };

  const recent = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      createdAt: { gt: new Date(Date.now() - REQUEST_COOLDOWN_SECONDS * 1000) },
    },
    select: { id: true },
  });
  if (recent) return { status: "cooldown" };

  // Eski açık bağlantıları temizle; en fazla MAX_ACTIVE_TOKENS kalsın.
  const active = await prisma.passwordResetToken.findMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (active.length >= MAX_ACTIVE_TOKENS) {
    await prisma.passwordResetToken.deleteMany({
      where: { id: { in: active.slice(MAX_ACTIVE_TOKENS - 1).map((t) => t.id) } },
    });
  }

  const token = crypto.randomBytes(32).toString("base64url");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
    },
  });

  return { status: "created", token, userId: user.id };
}

export type TokenCheck =
  | { valid: true; tokenId: string; userId: string }
  | { valid: false; reason: "not_found" | "used" | "expired" };

export async function checkResetToken(token: string): Promise<TokenCheck> {
  if (!token) return { valid: false, reason: "not_found" };

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });

  if (!record) return { valid: false, reason: "not_found" };
  if (record.usedAt) return { valid: false, reason: "used" };
  if (record.expiresAt < new Date()) return { valid: false, reason: "expired" };

  return { valid: true, tokenId: record.id, userId: record.userId };
}

export type ResetResult = { ok: true } | { ok: false; error: string };

export async function resetPassword(token: string, newPassword: string): Promise<ResetResult> {
  if (newPassword.length < 8) {
    return { ok: false, error: "Şifre en az 8 karakter olmalıdır." };
  }

  const check = await checkResetToken(token);
  if (!check.valid) {
    return {
      ok: false,
      error:
        check.reason === "expired"
          ? "Bağlantının süresi dolmuş. Lütfen yeni bir sıfırlama bağlantısı isteyin."
          : check.reason === "used"
            ? "Bu bağlantı zaten kullanılmış. Lütfen yeni bir bağlantı isteyin."
            : "Bağlantı geçersiz. Lütfen yeni bir sıfırlama bağlantısı isteyin.",
    };
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: check.userId }, data: { password: hashed } }),
    // Kullanılan token işaretlenir...
    prisma.passwordResetToken.update({
      where: { id: check.tokenId },
      data: { usedAt: new Date() },
    }),
    // ...ve aynı hesabın diğer açık bağlantıları geçersiz kılınır.
    prisma.passwordResetToken.deleteMany({
      where: { userId: check.userId, usedAt: null, id: { not: check.tokenId } },
    }),
    // Veritabanı oturumları da kapatılır (JWT oturumları süresi dolunca düşer).
    prisma.session.deleteMany({ where: { userId: check.userId } }),
  ]);

  return { ok: true };
}
