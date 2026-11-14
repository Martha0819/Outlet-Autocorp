import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

function puedeVerActividad(auth, actividad) {
  if (esAdministrador(auth.usuario)) return true;
  return actividad.unidadNegocioId === null || actividad.unidadNegocioId === auth.usuario.unidadNegocioId;
}

export async function PATCH(request, { params }) {
  const auth = await requirePermiso('actividad', 'editar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.actividad.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!puedeVerActividad(auth, objetivo)) {
    return Response.json({ error: 'No puedes editar actividades de otra unidad de negocio' }, { status: 403 });
  }

  const body = await request.json();
  const data = {};

  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.fecha !== undefined) data.fecha = new Date(body.fecha);
  if (body.horario !== undefined) data.horario = new Date(`1970-01-01T${body.horario}:00Z`);
  // Solo Administrador puede reasignar la unidad (incluido dejarla null).
  if (body.unidadNegocioId !== undefined && esAdministrador(auth.usuario)) {
    data.unidadNegocioId = body.unidadNegocioId ? Number(body.unidadNegocioId) : null;
  }
  if (body.responsableId !== undefined) data.responsableId = body.responsableId ? Number(body.responsableId) : null;
  if (body.estatus !== undefined) data.estatus = body.estatus;
  if (body.observaciones !== undefined) data.observaciones = body.observaciones?.trim() ? body.observaciones.trim() : null;

  try {
    const actividad = await prisma.actividad.update({
      where: { id: Number(params.id) },
      data,
      include: { unidadNegocio: true, responsable: { select: USUARIO_PUBLIC_SELECT } },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'editar', recurso: 'actividad', recursoId: actividad.id });
    return Response.json(actividad);
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requirePermiso('actividad', 'eliminar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.actividad.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!puedeVerActividad(auth, objetivo)) {
    return Response.json({ error: 'No puedes eliminar actividades de otra unidad de negocio' }, { status: 403 });
  }

  try {
    await prisma.actividad.delete({ where: { id: Number(params.id) } });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'eliminar', recurso: 'actividad', recursoId: Number(params.id) });
    return Response.json({ ok: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    throw error;
  }
}
