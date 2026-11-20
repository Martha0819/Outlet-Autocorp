import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

async function puedeVerGuardia(auth, guardia) {
  if (esAdministrador(auth.usuario)) return true;
  if (!guardia.usuarioId) return true;
  const usuarioAsignado = await prisma.usuario.findUnique({ where: { id: guardia.usuarioId } });
  return usuarioAsignado?.unidadNegocioId === auth.usuario.unidadNegocioId;
}

export async function PATCH(request, { params }) {
  const auth = await requirePermiso('guardia', 'editar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.guardia.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!(await puedeVerGuardia(auth, objetivo))) {
    return Response.json({ error: 'No puedes editar guardias de otra unidad de negocio' }, { status: 403 });
  }

  const body = await request.json();
  const data = {};

  if (body.usuarioId !== undefined) data.usuarioId = body.usuarioId ? Number(body.usuarioId) : null;
  if (body.asesorNombre !== undefined) data.asesorNombre = body.asesorNombre?.trim() || null;
  if (body.asesorCorreo !== undefined) data.asesorCorreo = body.asesorCorreo?.trim() || null;
  if (body.asesorTelefono !== undefined) data.asesorTelefono = body.asesorTelefono?.trim() || null;
  if (body.turnoId !== undefined) data.turnoId = Number(body.turnoId);
  if (body.fecha !== undefined) data.fecha = new Date(body.fecha);
  if (body.horarioInicio !== undefined) data.horarioInicio = body.horarioInicio ? new Date(`1970-01-01T${body.horarioInicio}:00Z`) : null;
  if (body.horarioFin !== undefined) data.horarioFin = body.horarioFin ? new Date(`1970-01-01T${body.horarioFin}:00Z`) : null;
  if (body.area !== undefined) data.area = body.area?.trim() ? body.area.trim() : null;

  try {
    const guardia = await prisma.guardia.update({
      where: { id: Number(params.id) },
      data,
      include: { usuario: { select: USUARIO_PUBLIC_SELECT }, turno: true },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'editar', recurso: 'guardia', recursoId: guardia.id });
    return Response.json(guardia);
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requirePermiso('guardia', 'eliminar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.guardia.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!(await puedeVerGuardia(auth, objetivo))) {
    return Response.json({ error: 'No puedes eliminar guardias de otra unidad de negocio' }, { status: 403 });
  }

  try {
    await prisma.guardia.delete({ where: { id: Number(params.id) } });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'eliminar', recurso: 'guardia', recursoId: Number(params.id) });
    return Response.json({ ok: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    throw error;
  }
}
