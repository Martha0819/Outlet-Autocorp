import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAccessCookie, setRefreshCookie } from '@/lib/auth/cookies';
import { getAuthConfig } from '@/lib/auth/config';
import { estaBloqueado, registrarIntentoFallido, limpiarIntentos } from '@/lib/auth/rateLimit';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { getPermisosDeRol } from '@/lib/auth/permisos';

const ADMIN_TIPO_USUARIO_NOMBRE = 'Administrador';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'email y password son requeridos' }, { status: 400 });
  }

  const rateLimitKey = email.toLowerCase();
  if (estaBloqueado(rateLimitKey)) {
    return Response.json(
      { error: 'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentar.' },
      { status: 429 }
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { tipoUsuario: true },
  });

  if (!usuario || !usuario.activo || !(await verifyPassword(password, usuario.passwordHash))) {
    registrarIntentoFallido(rateLimitKey);
    return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }
  limpiarIntentos(rateLimitKey);

  const { accessTokenTtlSeconds, refreshTokenTtlSeconds } = getAuthConfig();
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(usuario),
    signRefreshToken(usuario),
  ]);

  const cookieStore = await cookies();
  setAccessCookie(cookieStore, accessToken, accessTokenTtlSeconds);
  setRefreshCookie(cookieStore, refreshToken, refreshTokenTtlSeconds);

  await registrarBitacora({ usuarioId: usuario.id, accion: 'login', recurso: 'usuario', recursoId: usuario.id });

  const esAdministrador = usuario.tipoUsuario.nombre === ADMIN_TIPO_USUARIO_NOMBRE;

  return Response.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    tipoUsuarioId: usuario.tipoUsuarioId,
    tipoUsuarioNombre: usuario.tipoUsuario.nombre,
    unidadNegocioId: usuario.unidadNegocioId,
    esAdministrador,
    permisos: esAdministrador ? [] : await getPermisosDeRol(usuario.tipoUsuarioId),
  });
}
