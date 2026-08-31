import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/**
 * /admin  → yalnızca ADMIN
 * /hesabim → giriş yapmış herhangi bir kullanıcı
 *
 * Sipariş akışı (/odeme, /sepet, /siparis) bilinçli olarak korunmaz:
 * üye olmadan sipariş verilebilir.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/giris", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/hesabim")) {
    if (!token) {
      const url = new URL("/giris", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*"],
};
