import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// El middleware corre en Edge runtime: no puede usar Prisma (requiere Node.js
// runtime), así que solo valida firma + expiración del access token. La
// revocación real (logout, tokenVersion) la aplican las rutas que sí leen la
// BD — ver src/app/api/auth/verify/route.js. Esto es suficiente como gate de
// UI: una página protegida puede renderizar su cascarón con un token ya
// revocado, pero no puede traer datos reales sin pasar ese segundo check.

const PUBLIC_PATHS = ['/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    // Si no ha iniciado sesión, entra directamente como invitado
    return NextResponse.redirect(new URL(`/api/auth/guest?redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
    await jwtVerify(accessToken, secret);
    return NextResponse.next();
  } catch {
    // Si el token es inválido o expiró, entra directamente como invitado
    return NextResponse.redirect(new URL(`/api/auth/guest?redirect=${encodeURIComponent(pathname)}`, request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.svg$).*)'],
};
