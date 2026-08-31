import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/password-reset";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = (await request.json()) as { token?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!body.token) {
    return NextResponse.json({ error: "Bağlantı geçersiz." }, { status: 400 });
  }
  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: "Şifre en az 8 karakter olmalıdır.", field: "password" },
      { status: 422 }
    );
  }

  const result = await resetPassword(body.token, body.password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
