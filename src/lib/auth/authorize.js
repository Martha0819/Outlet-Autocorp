import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from './jwt';
import { ACCESS_COOKIE_NAME } from './cookies';

const ADMIN_TIPO_USUARIO_NOMBRE = 'Administrador';

// Null si no hay sesión válida (cookie ausente, firma inválida, expirada, o
// tokenVersion ya revocada por un logout/reset de password posterior).
export async function getUsuarioAutenticado() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) return null;

  let payload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    return null;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(payload.sub) },
    include: { tipoUsuario: true },
  });

  if (!usuario || !usuario.activo || usuario.tokenVersion !== payload.tokenVersion) {
    return null;
  }
  return usuario;
}

/**
 * Exige que la sesión actual tenga el permiso (recurso, accion) asignado a
 * su tipoUsuario en tipo_usuario_permiso. Administrador siempre pasa (sin
 * esto, el primer deploy de esta función bloquea a todos por igual, porque
 * la matriz de permisos arranca vacía hasta que alguien la llena desde
 * /usuarios → Permisos — y nadie podría entrar ahí para llenarla).
 *
 * Devuelve { usuario } en éxito, o { error: Response } listo para `return`
 * directo desde el route handler.
 */
export async function requirePermiso(recurso, accion) {
  const usuario = await getUsuarioAutenticado();
  if (!usuario) {
    return { error: Response.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  if (usuario.tipoUsuario.nombre === ADMIN_TIPO_USUARIO_NOMBRE) {
    return { usuario };
  }

  const permiso = await prisma.permiso.findUnique({ where: { recurso_accion: { recurso, accion } } });
  if (!permiso) {
    return { error: Response.json({ error: `Permiso no configurado: ${recurso}.${accion}` }, { status: 403 }) };
  }

  const asignado = await prisma.tipoUsuarioPermiso.findUnique({
    where: { tipoUsuarioId_permisoId: { tipoUsuarioId: usuario.tipoUsuarioId, permisoId: permiso.id } },
  });
  if (!asignado) {
    return { error: Response.json({ error: `No tienes permiso para ${accion} sobre ${recurso}` }, { status: 403 }) };
  }

  return { usuario };
}

export function esAdministrador(usuario) {
  return usuario.tipoUsuario?.nombre === ADMIN_TIPO_USUARIO_NOMBRE;
}
