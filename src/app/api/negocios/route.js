import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { validarEnganche } from '@/lib/validations/negocio';
import { estatusVehiculoParaNegocio, TIPOS_NEGOCIO } from '@/lib/negocios/estatusVehiculo';

const INCLUDE_NEGOCIO = {
  cliente: true,
  usuario: { select: USUARIO_PUBLIC_SELECT },
  unidadNegocio: true,
  lineaNegocio: true,
  tipoSeguimiento: true,
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
    tipoSeguimientoId,
    vehiculoId,
    enganche,
    totalUnidad,
    folio,
    observaciones,
  } = body;

  if (!clienteId || !lineaNegocioId) {
    return Response.json({ error: 'clienteId y lineaNegocioId son requeridos' }, { status: 400 });
  }

  // `tipo` es la fuente única de verdad de qué es este negocio (y de si
  // aparta o no el vehículo); dioEnganche se deriva de él, nunca al revés,
  // para que ambos no puedan quedar en desacuerdo.
  const tipo = TIPOS_NEGOCIO.includes(body.tipo) ? body.tipo : 'SOLICITUD';
  const dioEnganche = tipo === 'APARTADO';

  try {
    validarEnganche({ dioEnganche, enganche: dioEnganche ? (enganche ?? null) : null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  if (vehiculoId) {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(vehiculoId) } });
    if (!esAdministrador(auth.usuario) && (!vehiculo || vehiculo.unidadNegocioId !== auth.usuario.unidadNegocioId)) {
      return Response.json({ error: 'No puedes vincular un vehículo de otra unidad de negocio' }, { status: 403 });
    }
    // Un vehículo ya APARTADO o VENDIDO (por otro negocio) no puede
    // volver a asignarse: el filtro del combobox es solo UX, esto es lo
    // que de verdad lo impide.
    if (vehiculo && vehiculo.estatus !== 'DISPONIBLE') {
      return Response.json({ error: 'Ese vehículo ya no está disponible' }, { status: 400 });
    }
  }

  let negocio;
  try {
    negocio = await prisma.negocio.create({
      data: {
        clienteId: Number(clienteId),
        usuarioId: auth.usuario.id,
        unidadNegocioId: auth.usuario.unidadNegocioId,
        lineaNegocioId: Number(lineaNegocioId),
        tipoSeguimientoId: tipoSeguimientoId ? Number(tipoSeguimientoId) : null,
        vehiculoId: vehiculoId ? Number(vehiculoId) : null,
        tipo,
        dioEnganche,
        enganche: dioEnganche ? enganche : null,
        totalUnidad: totalUnidad !== undefined && totalUnidad !== null && totalUnidad !== '' ? totalUnidad : null,
        folio: folio?.trim() ? folio.trim() : null,
        observaciones: observaciones?.trim() ? observaciones.trim() : null,
      },
      include: INCLUDE_NEGOCIO,
    });
  } catch (error) {
    if (error.code === 'P2003') {
      return Response.json({ error: 'El cliente, línea de negocio, seguimiento o vehículo indicado no existe' }, { status: 400 });
    }
    throw error;
  }

  if (vehiculoId) {
    const estatus = estatusVehiculoParaNegocio({ tipo });
    // Un negocio recién creado sin venta ni enganche no mueve el vehículo
    // (sigue DISPONIBLE, nada que registrar); solo se audita cuando de
    // verdad lo aparta o lo vende.
    if (estatus !== 'DISPONIBLE') {
      await prisma.vehiculo.update({ where: { id: Number(vehiculoId) }, data: { estatus } });
      await registrarBitacora({
        usuarioId: auth.usuario.id,
        accion: 'editar',
        recurso: 'vehiculo',
        recursoId: Number(vehiculoId),
        detalle: `estatus -> ${estatus} (automático por negocio #${negocio.id})`,
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
