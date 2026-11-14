import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth/jwt';
import { setAccessCookie, REFRESH_COOKIE_NAME } from '@/lib/auth/cookies';
import { getAuthConfig } from '@/lib/auth/config';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return Response.json({ error: 'No hay sesión activa' }, { status: 401 });
  }

  let payload;
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    return Response.json({ error: 'Refresh token inválido o expirado' }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(payload.sub) } });

  if (!usuario || !usuario.activo || usuario.tokenVersion !== payload.tokenVersion) {
    return Response.json({ error: 'Sesión inválida' }, { status: 401 });
  }

  const { accessTokenTtlSeconds } = getAuthConfig();
  const accessToken = await signAccessToken(usuario);
  setAccessCookie(cookieStore, accessToken, accessTokenTtlSeconds);

  return Response.json({ ok: true });
}
