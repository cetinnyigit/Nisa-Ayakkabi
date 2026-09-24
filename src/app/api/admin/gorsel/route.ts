import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isBlobConfigured } from "@/lib/blob";
import { slugify } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  if (!isBlobConfigured()) {
    return NextResponse.json(
      {
        error:
          "Görsel yükleme yapılandırılmamış. Vercel Blob bağlanana kadar " +
          "görsel adresini elle yapıştırabilirsiniz.",
        notConfigured: true,
      },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Yalnızca JPEG, PNG, WebP veya AVIF yükleyebilirsiniz." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Dosya en fazla 5 MB olabilir." }, { status: 413 });
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "urun";

  try {
    const blob = await put(`urunler/${base}-${Date.now()}.${extension}`, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Görsel yüklenemedi:", error);
    return NextResponse.json({ error: "Görsel yüklenemedi." }, { status: 500 });
  }
}
