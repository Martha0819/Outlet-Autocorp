import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

async function puedeVerDemo(auth, demo) {
  if (esAdministrador(auth.usuario)) return true;
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id: demo.vehiculoId } });
  return vehiculo?.unidadNegocioId === auth.usuario.unidadNegocioId;
}

export async function PATCH(request, { params }) {
  const auth = await requirePermiso('demo', 'editar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.demo.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!(await puedeVerDemo(auth, objetivo))) {
    return Response.json({ error: 'No puedes editar demos de otra unidad de negocio' }, { status: 403 });
  }

  const body = await request.json();
  const data = {};
  if (body.fecha !== undefined) data.fecha = new Date(body.fecha);
  if (body.observaciones !== undefined) data.observaciones = body.observaciones?.trim() ? body.observaciones.trim() : null;

  const demo = await prisma.demo.update({
    where: { id: Number(params.id) },
    data,
    include: { cliente: true, vehiculo: { include: { marca: true } }, usuario: { select: USUARIO_PUBLIC_SELECT } },
  });
  await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'editar', recurso: 'demo', recursoId: demo.id });
  return Response.json(demo);
}

export async function DELETE(_request, { params }) {
  const auth = await requirePermiso('demo', 'eliminar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.demo.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!(await puedeVerDemo(auth, objetivo))) {
    return Response.json({ error: 'No puedes eliminar demos de otra unidad de negocio' }, { status: 403 });
  }

  await prisma.demo.delete({ where: { id: Number(params.id) } });
  await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'eliminar', recurso: 'demo', recursoId: Number(params.id) });
  return Response.json({ ok: true });
}
