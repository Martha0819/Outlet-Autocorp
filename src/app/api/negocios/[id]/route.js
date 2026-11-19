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
  if (body.totalUnidad !== undefined) {
    data.totalUnidad = body.totalUnidad !== null && body.totalUnidad !== '' ? body.totalUnidad : null;
  }

  if (body.vehiculoId !== undefined) {
    if (body.vehiculoId && !esAdministrador(auth.usuario)) {
      const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(body.vehiculoId) } });
      if (!vehiculo || vehiculo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
        return Response.json({ error: 'No puedes vincular un vehículo de otra unidad de negocio' }, { status: 403 });
      }
    }
    data.vehiculoId = body.vehiculoId ? Number(body.vehiculoId) : null;
  }

  const dioEngancheFinal = body.dioEnganche !== undefined ? Boolean(body.dioEnganche) : objetivo.dioEnganche;
  const engancheFinal = body.enganche !== undefined ? body.enganche : objetivo.enganche;
  if (body.dioEnganche !== undefined || body.enganche !== undefined) {
    try {
      validarEnganche({ dioEnganche: dioEngancheFinal, enganche: dioEngancheFinal ? engancheFinal : null });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    data.dioEnganche = dioEngancheFinal;
    data.enganche = dioEngancheFinal ? engancheFinal : null;
  }

  try {
    const negocio = await prisma.negocio.update({
      where: { id: Number(params.id) },
      data,
      include: INCLUDE_NEGOCIO,
    });
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
    throw error;
  }
}
