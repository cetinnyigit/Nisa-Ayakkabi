import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

type Body = { name?: string; email?: string; password?: string };

export async function POST(request: Request) {
  // Aynı IP'den saatte en fazla 5 hesap
  const limit = rateLimit(`kayit:${clientIp(request)}`, 5, 3600);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.toLowerCase().trim();
  const password = body.password ?? "";

  if (!name) {
    return NextResponse.json({ error: "Ad soyad zorunludur.", field: "name" }, { status: 422 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin.", field: "email" },
      { status: 422 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Şifre en az 8 karakter olmalıdır.", field: "password" },
      { status: 422 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json(
      { error: "Bu e-posta adresi zaten kayıtlı.", field: "email" },
      { status: 409 }
    );
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      // Rol asla istemciden alınmaz; yeni kayıtlar daima müşteridir.
      role: "CUSTOMER",
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
