import { prisma } from '@/lib/prisma';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { parsePagination, buildPaginatedResponse } from '@/lib/pagination';

export async function GET(request) {
  const auth = await requirePermiso('vehiculo', 'leer');
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const estatus = url.searchParams.get('estatus');
  const marcaId = url.searchParams.get('marcaId');
  const servicioId = url.searchParams.get('servicioId');
  const q = url.searchParams.get('q');

  const esInvitado = auth.usuario?.tipoUsuario?.nombre === 'Invitado' || auth.usuario?.esInvitado;

  // Los filtros van al WHERE (no al cliente): con paginación, filtrar solo
  // la página ya traída daría resultados incompletos/engañosos.
  const where = {
    ...(esAdministrador(auth.usuario) || esInvitado ? {} : { unidadNegocioId: auth.usuario.unidadNegocioId }),
    ...(estatus && estatus !== 'all' ? { estatus } : {}),
    ...(marcaId && marcaId !== 'all' ? { marcaId: Number(marcaId) } : {}),
    ...(servicioId && servicioId !== 'all' ? { servicioId: Number(servicioId) } : {}),
    ...(q
      ? {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' } },
            { modelo: { contains: q, mode: 'insensitive' } },
            { vin: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const pagination = parsePagination(request);

  const sanitizarVehiculo = (v) => {
    if (!esInvitado) return v;
    return {
      ...v,
      precioSinIva: null,
      precioLista: null,
      precioRemate: null,
      bono: null,
    };
  };

  if (!pagination) {
    const vehiculos = await prisma.vehiculo.findMany({
      where,
      include: { marca: true, unidadNegocio: true },
      orderBy: { id: 'desc' },
    });
    return Response.json(esInvitado ? vehiculos.map(sanitizarVehiculo) : vehiculos);
  }

  const [vehiculos, total] = await Promise.all([
    prisma.vehiculo.findMany({
      where,
      include: { marca: true, unidadNegocio: true },
      orderBy: { id: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.vehiculo.count({ where }),
  ]);
  return Response.json(buildPaginatedResponse(esInvitado ? vehiculos.map(sanitizarVehiculo) : vehiculos, total, pagination));
}

export async function POST(request) {
  const auth = await requirePermiso('vehiculo', 'crear');
  if (auth.error) return auth.error;

  const body = await request.json();
  const { nombre, modelo, anio, km, vin, transmision, colorExterior, colorInterior, marcaId, servicioId, precioSinIva, precioLista, precioRemate, bono, diasInventario } = body;
  // Un no-Administrador solo puede crear vehículos en su propia unidad.
  const unidadNegocioId = esAdministrador(auth.usuario) ? body.unidadNegocioId : auth.usuario.unidadNegocioId;

  if (!nombre?.trim() || !modelo?.trim() || !anio || !marcaId || !unidadNegocioId) {
    return Response.json(
      { error: 'nombre, modelo, anio, marcaId y unidadNegocioId son requeridos' },
      { status: 400 }
    );
  }
  if (!precioLista) {
    return Response.json({ error: 'precioLista es requerido' }, { status: 400 });
  }

  try {
    const vehiculo = await prisma.vehiculo.create({
      data: {
        nombre,
        modelo,
        anio: Number(anio),
        km: Number(km) || 0,
        vin: vin?.trim() ? vin.trim() : null,
        transmision: transmision?.trim() ? transmision.trim() : null,
        colorExterior: colorExterior?.trim() ? colorExterior.trim() : null,
        colorInterior: colorInterior?.trim() ? colorInterior.trim() : null,
        marcaId: Number(marcaId),
        unidadNegocioId: Number(unidadNegocioId),
        servicioId: servicioId ? Number(servicioId) : null,
        precioSinIva: precioSinIva ? Number(precioSinIva) : null,
        precioLista: Number(precioLista),
        precioRemate: precioRemate ? Number(precioRemate) : null,
        bono: bono ? Number(bono) : null,
        diasInventario: diasInventario !== undefined && diasInventario !== '' ? Number(diasInventario) : null,
      },
      include: { marca: true, unidadNegocio: true },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'vehiculo', recursoId: vehiculo.id, detalle: `${vehiculo.nombre} ${vehiculo.modelo}` });
    return Response.json(vehiculo, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Ya existe un vehículo con ese VIN' }, { status: 409 });
    }
    if (error.code === 'P2003') {
      return Response.json({ error: 'La marca, unidad de negocio o servicio indicado no existe' }, { status: 400 });
    }
    throw error;
  }
}
