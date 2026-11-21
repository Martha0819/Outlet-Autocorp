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
  etapa: true,
  vehiculo: { include: { marca: true } },
};

export async function PATCH(request, { params }) {
  const auth = await requirePermiso('negocio', 'editar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.negocio.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!esAdministrador(auth.usuario) && objetivo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
    return Response.json({ error: 'No puedes editar negocios de otra unidad de negocio' }, { status: 403 });
  }

  const body = await request.json();
  const data = {};

  if (body.lineaNegocioId !== undefined) data.lineaNegocioId = Number(body.lineaNegocioId);
  if (body.etapaId !== undefined) data.etapaId = Number(body.etapaId);
  if (body.tipoSeguimientoId !== undefined) data.tipoSeguimientoId = body.tipoSeguimientoId ? Number(body.tipoSeguimientoId) : null;
  if (body.observaciones !== undefined) data.observaciones = body.observaciones?.trim() ? body.observaciones.trim() : null;
  if (body.folio !== undefined) data.folio = body.folio?.trim() ? body.folio.trim() : null;
  if (body.totalUnidad !== undefined) {
    data.totalUnidad = body.totalUnidad !== null && body.totalUnidad !== '' ? body.totalUnidad : null;
  }

  if (body.vehiculoId !== undefined) {
    // Solo se valida si de verdad está cambiando de vehículo: el que este
    // negocio ya tenía asignado puede estar APARTADO/VENDIDO por su propia
    // causa, y seguir editando el negocio no debe rechazarlo por eso.
    const cambiaVehiculo = Number(body.vehiculoId) !== objetivo.vehiculoId;
    if (body.vehiculoId && cambiaVehiculo) {
      const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(body.vehiculoId) } });
      if (!esAdministrador(auth.usuario) && (!vehiculo || vehiculo.unidadNegocioId !== auth.usuario.unidadNegocioId)) {
        return Response.json({ error: 'No puedes vincular un vehículo de otra unidad de negocio' }, { status: 403 });
      }
      if (vehiculo && vehiculo.estatus !== 'DISPONIBLE') {
        return Response.json({ error: 'Ese vehículo ya no está disponible' }, { status: 400 });
      }
    }
    data.vehiculoId = body.vehiculoId ? Number(body.vehiculoId) : null;
  }

  // `tipo` es la fuente única de verdad: si llega, dioEnganche se deriva de
  // él (nunca al revés), para que no puedan quedar en desacuerdo.
  const tipoFinal = body.tipo !== undefined
    ? (TIPOS_NEGOCIO.includes(body.tipo) ? body.tipo : objetivo.tipo)
    : objetivo.tipo;
  const dioEngancheFinal = tipoFinal === 'APARTADO';
  const engancheFinal = body.enganche !== undefined ? body.enganche : objetivo.enganche;

  if (body.tipo !== undefined || body.enganche !== undefined) {
    try {
      validarEnganche({ dioEnganche: dioEngancheFinal, enganche: dioEngancheFinal ? engancheFinal : null });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (body.tipo !== undefined) data.tipo = tipoFinal;
    data.dioEnganche = dioEngancheFinal;
    data.enganche = dioEngancheFinal ? engancheFinal : null;
  }

  try {
    const negocio = await prisma.negocio.update({
      where: { id: Number(params.id) },
      data,
      include: INCLUDE_NEGOCIO,
    });

    // Se recalcula el estatus completo (no solo "¿subió a VENDIDO/APARTADO?")
    // cada vez que algo que lo determina cambió, para que también sepa
    // BAJAR: un enganche que se desmarca, una venta que se deshace o un
    // vehículo que se desvincula del negocio deben liberar el vehículo, no
    // dejarlo atascado en su último estatus.
    const vIdAnterior = objetivo.vehiculoId;
    const vIdFinal = data.vehiculoId !== undefined ? data.vehiculoId : objetivo.vehiculoId;
    const tocaEstatusVehiculo = data.vehiculoId !== undefined || data.tipo !== undefined;

    if (tocaEstatusVehiculo) {
      if (vIdFinal) {
        const estatus = estatusVehiculoParaNegocio({ tipo: tipoFinal });
        await prisma.vehiculo.update({ where: { id: Number(vIdFinal) }, data: { estatus } });
        await registrarBitacora({
          usuarioId: auth.usuario.id,
          accion: 'editar',
          recurso: 'vehiculo',
          recursoId: Number(vIdFinal),
          detalle: `estatus -> ${estatus} (automático por negocio #${negocio.id})`,
        });
      }
      if (vIdAnterior && vIdAnterior !== vIdFinal) {
        await prisma.vehiculo.update({ where: { id: Number(vIdAnterior) }, data: { estatus: 'DISPONIBLE' } });
        await registrarBitacora({
          usuarioId: auth.usuario.id,
          accion: 'editar',
          recurso: 'vehiculo',
          recursoId: Number(vIdAnterior),
          detalle: `estatus -> DISPONIBLE (liberado al desvincularse del negocio #${negocio.id})`,
        });
      }
    }
    await registrarBitacora({
      usuarioId: auth.usuario.id,
      accion: 'editar',
      recurso: 'negocio',
      recursoId: negocio.id,
      detalle: JSON.stringify(Object.keys(data)),
    });
    return Response.json(negocio);
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    if (error.code === 'P2003') {
      return Response.json({ error: 'La línea de negocio, etapa, seguimiento o vehículo indicado no existe' }, { status: 400 });
    }
    throw error;
  }
}
