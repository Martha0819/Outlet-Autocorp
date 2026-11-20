import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { parsePagination, buildPaginatedResponse } from '@/lib/pagination';

export async function GET(request) {
  const auth = await requirePermiso('actividad', 'leer');
  if (auth.error) return auth.error;

  // unidadNegocioId NULL = actividad de todo el evento, visible para
  // cualquiera; si no es null, solo para esa unidad (o Administrador).
  const where = esAdministrador(auth.usuario)
    ? {}
    : { OR: [{ unidadNegocioId: auth.usuario.unidadNegocioId }, { unidadNegocioId: null }] };
  const pagination = parsePagination(request);

  if (!pagination) {
    const actividades = await prisma.actividad.findMany({
      where,
      include: { unidadNegocio: true, responsable: { select: USUARIO_PUBLIC_SELECT } },
      orderBy: { fecha: 'asc' },
    });
    return Response.json(actividades);
  }

  const [actividades, total] = await Promise.all([
    prisma.actividad.findMany({
      where,
      include: { unidadNegocio: true, responsable: { select: USUARIO_PUBLIC_SELECT } },
      orderBy: { fecha: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.actividad.count({ where }),
  ]);
  return Response.json(buildPaginatedResponse(actividades, total, pagination));
}

export async function POST(request) {
  const auth = await requirePermiso('actividad', 'crear');
  if (auth.error) return auth.error;

  const body = await request.json();
  const { nombre, fecha, horario, responsableId, responsableNombre, estatus, observaciones } = body;
  // Solo Administrador puede dejarla event-wide (null) o elegir otra
  // unidad; cualquier otro rol siempre crea para su propia unidad.
  const unidadNegocioId = esAdministrador(auth.usuario)
    ? (body.unidadNegocioId ? Number(body.unidadNegocioId) : null)
    : auth.usuario.unidadNegocioId;

  if (!nombre?.trim() || !fecha || !horario) {
    return Response.json({ error: 'nombre, fecha y horario son requeridos' }, { status: 400 });
  }

  const actividad = await prisma.actividad.create({
    data: {
      nombre,
      fecha: new Date(fecha),
      horario: new Date(`1970-01-01T${horario}:00Z`),
      unidadNegocioId,
      responsableId: responsableId ? Number(responsableId) : null,
      responsableNombre: responsableNombre?.trim() || null,
      estatus: estatus || 'PENDIENTE',
      observaciones: observaciones?.trim() ? observaciones.trim() : null,
    },
    include: { unidadNegocio: true, responsable: { select: USUARIO_PUBLIC_SELECT } },
  });
  await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'actividad', recursoId: actividad.id, detalle: actividad.nombre });
  return Response.json(actividad, { status: 201 });
}
