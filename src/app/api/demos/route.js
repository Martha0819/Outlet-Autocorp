import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { parsePagination, buildPaginatedResponse } from '@/lib/pagination';

export async function GET(request) {
  const auth = await requirePermiso('demo', 'leer');
  if (auth.error) return auth.error;

  // Demo no tiene su propia unidadNegocioId: se infiere del vehículo usado
  // (el dealer donde físicamente ocurrió la prueba de manejo).
  const where = esAdministrador(auth.usuario) ? {} : { vehiculo: { unidadNegocioId: auth.usuario.unidadNegocioId } };
  const include = {
    cliente: true,
    vehiculo: { include: { marca: true } },
    usuario: { select: USUARIO_PUBLIC_SELECT },
  };
  const pagination = parsePagination(request);

  if (!pagination) {
    const demos = await prisma.demo.findMany({ where, include, orderBy: { fecha: 'desc' } });
    return Response.json(demos);
  }

  const [demos, total] = await Promise.all([
    prisma.demo.findMany({ where, include, orderBy: { fecha: 'desc' }, skip: pagination.skip, take: pagination.take }),
    prisma.demo.count({ where }),
  ]);
  return Response.json(buildPaginatedResponse(demos, total, pagination));
}

export async function POST(request) {
  const auth = await requirePermiso('demo', 'crear');
  if (auth.error) return auth.error;

  const body = await request.json();
  const { clienteId, vehiculoId, fecha, observaciones } = body;

  if (!clienteId || !vehiculoId) {
    return Response.json({ error: 'clienteId y vehiculoId son requeridos' }, { status: 400 });
  }

  if (!esAdministrador(auth.usuario)) {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(vehiculoId) } });
    if (!vehiculo || vehiculo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
      return Response.json({ error: 'No puedes registrar una demo con un vehículo de otra unidad de negocio' }, { status: 403 });
    }
  }

  const demo = await prisma.demo.create({
    data: {
      clienteId: Number(clienteId),
      vehiculoId: Number(vehiculoId),
      usuarioId: auth.usuario.id,
      fecha: fecha ? new Date(fecha) : new Date(),
      observaciones: observaciones?.trim() ? observaciones.trim() : null,
    },
    include: {
      cliente: true,
      vehiculo: { include: { marca: true } },
      usuario: { select: USUARIO_PUBLIC_SELECT },
    },
  });
  await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'demo', recursoId: demo.id });
  return Response.json(demo, { status: 201 });
}
