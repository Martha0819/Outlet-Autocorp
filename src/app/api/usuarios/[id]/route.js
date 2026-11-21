import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

function toPublicUsuario(usuario) {
  const { passwordHash, tokenVersion, ...rest } = usuario;
  return rest;
}

// No hay DELETE a propósito: un usuario nunca se borra, solo se desactiva
// (PATCH { activo: false }) — preserva el historial de negocios/demos que
// quedaron ligados a su id.
export async function PATCH(request, { params }) {
  const auth = await requirePermiso('usuario', 'editar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.usuario.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!esAdministrador(auth.usuario) && objetivo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
    return Response.json({ error: 'No puedes editar usuarios de otra unidad de negocio' }, { status: 403 });
  }

  const body = await request.json();
  const data = {};

  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.email !== undefined) data.email = body.email;
  if (body.tipoUsuarioId !== undefined) data.tipoUsuarioId = Number(body.tipoUsuarioId);
  // Un no-Administrador no puede reasignar la unidad de negocio de nadie
  // (ni la suya ni la de otros) — eso es movimiento entre dealers.
  if (body.unidadNegocioId !== undefined && esAdministrador(auth.usuario)) {
    data.unidadNegocioId = Number(body.unidadNegocioId);
  }
  if (body.activo !== undefined) data.activo = body.activo;
  if (body.password) {
    data.passwordHash = await hashPassword(body.password);
    // Reset de password invalida sesiones activas en otros dispositivos.
    data.tokenVersion = { increment: 1 };
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: Number(params.id) },
      data,
      include: { tipoUsuario: true, unidadNegocio: true },
    });
    await registrarBitacora({
      usuarioId: auth.usuario.id,
      accion: 'editar',
      recurso: 'usuario',
      recursoId: usuario.id,
      detalle: JSON.stringify(Object.keys(data)),
    });
    return Response.json(toPublicUsuario(usuario));
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }
    if (error.code === 'P2003') {
      return Response.json({ error: 'El tipo de usuario o la unidad de negocio indicada no existe' }, { status: 400 });
    }
    throw error;
  }
}
