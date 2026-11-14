import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { parsePagination, buildPaginatedResponse } from '@/lib/pagination';

export async function GET(request) {
  const auth = await requirePermiso('guardia', 'leer');
  if (auth.error) return auth.error;

  // Guardia no tiene su propia unidadNegocioId: se infiere de a qué unidad
  // pertenece el usuario asignado.
  const where = esAdministrador(auth.usuario) ? {} : { usuario: { unidadNegocioId: auth.usuario.unidadNegocioId } };
  const pagination = parsePagination(request);

  if (!pagination) {
    const guardias = await prisma.guardia.findMany({
      where,
      include: { usuario: { select: USUARIO_PUBLIC_SELECT }, turno: true },
      orderBy: { fecha: 'asc' },
    });
    return Response.json(guardias);
  }

  const [guardias, total] = await Promise.all([
    prisma.guardia.findMany({
      where,
      include: { usuario: { select: USUARIO_PUBLIC_SELECT }, turno: true },
      orderBy: { fecha: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.guardia.count({ where }),
  ]);
  return Response.json(buildPaginatedResponse(guardias, total, pagination));
}

export async function POST(request) {
  const auth = await requirePermiso('guardia', 'crear');
  if (auth.error) return auth.error;

  const body = await request.json();
  const { usuarioId, fecha, horarioInicio, horarioFin, turnoId, area } = body;

  if (!usuarioId || !fecha || !turnoId) {
    return Response.json({ error: 'usuarioId, fecha y turnoId son requeridos' }, { status: 400 });
  }

  if (!esAdministrador(auth.usuario)) {
    const usuarioAsignado = await prisma.usuario.findUnique({ where: { id: Number(usuarioId) } });
    if (!usuarioAsignado || usuarioAsignado.unidadNegocioId !== auth.usuario.unidadNegocioId) {
      return Response.json({ error: 'No puedes programar guardias para usuarios de otra unidad de negocio' }, { status: 403 });
    }
  }

  const guardia = await prisma.guardia.create({
    data: {
      usuarioId: Number(usuarioId),
      fecha: new Date(fecha),
      horarioInicio: horarioInicio ? new Date(`1970-01-01T${horarioInicio}:00Z`) : null,
      horarioFin: horarioFin ? new Date(`1970-01-01T${horarioFin}:00Z`) : null,
      turnoId: Number(turnoId),
      area: area?.trim() ? area.trim() : null,
    },
    include: { usuario: { select: USUARIO_PUBLIC_SELECT }, turno: true },
  });
  await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'guardia', recursoId: guardia.id });
  return Response.json(guardia, { status: 201 });
}
