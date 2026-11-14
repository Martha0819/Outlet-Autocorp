import { prisma } from '@/lib/prisma';
import { requirePermiso } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

export async function POST(request) {
  const auth = await requirePermiso('usuario', 'editar');
  if (auth.error) return auth.error;

  const { tipoUsuarioId, permisoId } = await request.json();

  if (!tipoUsuarioId || !permisoId) {
    return Response.json({ error: 'tipoUsuarioId y permisoId son requeridos' }, { status: 400 });
  }

  const where = { tipoUsuarioId: Number(tipoUsuarioId), permisoId: Number(permisoId) };
  const existente = await prisma.tipoUsuarioPermiso.findUnique({ where: { tipoUsuarioId_permisoId: where } });

  if (existente) {
    await prisma.tipoUsuarioPermiso.delete({ where: { tipoUsuarioId_permisoId: where } });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'eliminar', recurso: 'permiso', detalle: JSON.stringify(where) });
    return Response.json({ asignado: false });
  }

  await prisma.tipoUsuarioPermiso.create({ data: where });
  await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'permiso', detalle: JSON.stringify(where) });
  return Response.json({ asignado: true });
}
