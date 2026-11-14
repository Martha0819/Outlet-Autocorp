import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { ACCESS_COOKIE_NAME } from '@/lib/auth/cookies';
import { getPermisosDeRol } from '@/lib/auth/permisos';

const ADMIN_TIPO_USUARIO_NOMBRE = 'Administrador';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  let payload;
  try {
    payload = await verifyAccessToken(accessToken);
  } catch {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(payload.sub) },
    include: { tipoUsuario: true },
  });

  if (!usuario || !usuario.activo || usuario.tokenVersion !== payload.tokenVersion) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const esAdministrador = usuario.tipoUsuario.nombre === ADMIN_TIPO_USUARIO_NOMBRE;

  return Response.json({
    authenticated: true,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      tipoUsuarioId: usuario.tipoUsuarioId,
      tipoUsuarioNombre: usuario.tipoUsuario.nombre,
      unidadNegocioId: usuario.unidadNegocioId,
      esAdministrador,
      permisos: esAdministrador ? [] : await getPermisosDeRol(usuario.tipoUsuarioId),
    },
  });
}
