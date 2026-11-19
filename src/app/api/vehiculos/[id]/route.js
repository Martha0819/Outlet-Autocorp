import { prisma } from '@/lib/prisma';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

// Sin DELETE a propósito, mismo criterio que /api/usuarios: un vehículo
// puede tener Demo/Negocio ligados por historial. "Retirar" un vehículo es
// PATCH { estatus: 'NO_DISPONIBLE' }, no borrar la fila.
export async function PATCH(request, { params }) {
  const auth = await requirePermiso('vehiculo', 'editar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.vehiculo.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!esAdministrador(auth.usuario) && objetivo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
    return Response.json({ error: 'No puedes editar vehículos de otra unidad de negocio' }, { status: 403 });
  }

  const body = await request.json();
  const data = {};

  for (const field of ['nombre', 'modelo', 'transmision', 'condicion', 'estatus', 'vin']) {
    if (body[field] !== undefined) data[field] = body[field] === '' && field === 'vin' ? null : body[field];
  }
  for (const field of ['anio', 'km', 'marcaId']) {
    if (body[field] !== undefined) data[field] = Number(body[field]);
  }
  // Un no-Administrador no puede mover un vehículo a otra unidad.
  if (body.unidadNegocioId !== undefined && esAdministrador(auth.usuario)) {
    data.unidadNegocioId = Number(body.unidadNegocioId);
  }
  if (body.precioSinIva !== undefined) {
    data.precioSinIva = body.precioSinIva === '' || body.precioSinIva === null ? null : Number(body.precioSinIva);
  }
  if (body.precioLista !== undefined) {
    if (body.precioLista === '' || body.precioLista === null) {
      return Response.json({ error: 'precioLista es requerido' }, { status: 400 });
    }
    data.precioLista = Number(body.precioLista);
  }
  if (body.precioRemate !== undefined) {
    data.precioRemate = body.precioRemate === '' || body.precioRemate === null ? null : Number(body.precioRemate);
  }
  if (body.bono !== undefined) {
    data.bono = body.bono === '' || body.bono === null ? null : Number(body.bono);
  }

  try {
    const vehiculo = await prisma.vehiculo.update({
      where: { id: Number(params.id) },
      data,
      include: { marca: true, unidadNegocio: true },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'editar', recurso: 'vehiculo', recursoId: vehiculo.id, detalle: JSON.stringify(Object.keys(data)) });
    return Response.json(vehiculo);
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return Response.json({ error: 'Ya existe un vehículo con ese VIN' }, { status: 409 });
    }
    throw error;
  }
}
