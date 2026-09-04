import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESION, sesionValida } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const autenticado = await sesionValida(request.cookies.get(COOKIE_SESION)?.value);

  if (pathname === "/login") {
    // Ya entro: no tiene sentido mostrarle el login otra vez.
    if (autenticado) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!autenticado) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Todo queda protegido menos los archivos estaticos de Next y el favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
