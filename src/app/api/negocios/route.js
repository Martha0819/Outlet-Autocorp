import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { validarEnganche } from '@/lib/validations/negocio';

const INCLUDE_NEGOCIO = {
  cliente: true,
  usuario: { select: USUARIO_PUBLIC_SELECT },
  unidadNegocio: true,
  lineaNegocio: true,
  tipoSeguimiento: true,
  etapa: true,
  vehiculo: { include: { marca: true } },
};

export async function GET(request) {
  const auth = await requirePermiso('negocio', 'leer');
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const clienteId = url.searchParams.get('clienteId');

  const where = {
    ...(esAdministrador(auth.usuario) ? {} : { unidadNegocioId: auth.usuario.unidadNegocioId }),
    ...(clienteId ? { clienteId: Number(clienteId) } : {}),
  };

  const negocios = await prisma.negocio.findMany({ where, include: INCLUDE_NEGOCIO, orderBy: { fecha: 'desc' } });
  return Response.json(negocios);
}

export async function POST(request) {
  const auth = await requirePermiso('negocio', 'crear');
  if (auth.error) return auth.error;

  const body = await request.json();
  const {
    clienteId,
    lineaNegocioId,
    etapaId,
    tipoSeguimientoId,
    vehiculoId,
    dioEnganche,
    enganche,
    totalUnidad,
    folio,
    observaciones,
  } = body;

  if (!clienteId || !lineaNegocioId || !etapaId) {
    return Response.json({ error: 'clienteId, lineaNegocioId y etapaId son requeridos' }, { status: 400 });
  }

  try {
    validarEnganche({ dioEnganche: Boolean(dioEnganche), enganche: enganche ?? null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (!esAdministrador(auth.usuario) && vehiculoId) {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(vehiculoId) } });
    if (!vehiculo || vehiculo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
      return Response.json({ error: 'No puedes vincular un vehículo de otra unidad de negocio' }, { status: 403 });
    }
  }

  const negocio = await prisma.negocio.create({
    data: {
      clienteId: Number(clienteId),
      usuarioId: auth.usuario.id,
      unidadNegocioId: auth.usuario.unidadNegocioId,
      lineaNegocioId: Number(lineaNegocioId),
      etapaId: Number(etapaId),
      tipoSeguimientoId: tipoSeguimientoId ? Number(tipoSeguimientoId) : null,
      vehiculoId: vehiculoId ? Number(vehiculoId) : null,
      dioEnganche: Boolean(dioEnganche),
      enganche: dioEnganche ? enganche : null,
      totalUnidad: totalUnidad !== undefined && totalUnidad !== null && totalUnidad !== '' ? totalUnidad : null,
      folio: folio?.trim() ? folio.trim() : null,
      observaciones: observaciones?.trim() ? observaciones.trim() : null,
    },
    include: INCLUDE_NEGOCIO,
  });

  if (vehiculoId) {
    if (totalUnidad !== undefined && totalUnidad !== null && totalUnidad !== '') {
      await prisma.vehiculo.update({
        where: { id: Number(vehiculoId) },
        data: { estatus: 'VENDIDO' },
      });
    } else if (dioEnganche) {
      await prisma.vehiculo.update({
        where: { id: Number(vehiculoId) },
        data: { estatus: 'APARTADO' },
      });
    }
  }

  await registrarBitacora({
    usuarioId: auth.usuario.id,
    accion: 'crear',
    recurso: 'negocio',
    recursoId: negocio.id,
    detalle: `Negocio para cliente ${negocio.cliente?.nombre || negocio.clienteId}`,
  });

  return Response.json(negocio, { status: 201 });
}
