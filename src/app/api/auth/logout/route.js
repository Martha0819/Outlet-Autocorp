import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { clearAuthCookies, ACCESS_COOKIE_NAME } from '@/lib/auth/cookies';
import { registrarBitacora } from '@/lib/auth/bitacora';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  // Incrementar tokenVersion invalida TODOS los tokens (access y refresh)
  // emitidos antes de este logout, en cualquier dispositivo de ese usuario.
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      const usuarioId = Number(payload.sub);
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { tokenVersion: { increment: 1 } },
      });
      await registrarBitacora({ usuarioId, accion: 'logout', recurso: 'usuario', recursoId: usuarioId });
    } catch {
      // Token ya inválido/expirado: no hay nada que revocar, seguimos a borrar cookies.
    }
  }

  clearAuthCookies(cookieStore);
  return Response.json({ ok: true });
}
