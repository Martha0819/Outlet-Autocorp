import { prisma } from '@/lib/prisma';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { parsePagination, buildPaginatedResponse } from '@/lib/pagination';

export async function GET(request) {
  const auth = await requirePermiso('cliente', 'leer');
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  const esInvitado = auth.usuario?.tipoUsuario?.nombre === 'Invitado' || auth.usuario?.esInvitado;
  const where = {
    ...(esAdministrador(auth.usuario) || esInvitado ? {} : { unidadNegocioId: auth.usuario.unidadNegocioId }),
    ...(q
      ? {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' } },
            { telefono: { contains: q } },
            { correo: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const pagination = parsePagination(request);

  if (!pagination) {
    const clientes = await prisma.cliente.findMany({ where, include: { marca: true }, orderBy: { id: 'desc' } });
    return Response.json(clientes);
  }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({ where, include: { marca: true }, orderBy: { id: 'desc' }, skip: pagination.skip, take: pagination.take }),
    prisma.cliente.count({ where }),
  ]);
  return Response.json(buildPaginatedResponse(clientes, total, pagination));
}

export async function POST(request) {
  const auth = await requirePermiso('cliente', 'crear');
  if (auth.error) return auth.error;

  const body = await request.json();
  const { nombre, telefono, correo, numeroAcompanantes, acompanantes, visitaMarcaEspecifica, marcaId, observaciones } = body;

  if (!nombre?.trim() || !telefono?.trim()) {
    return Response.json({ error: 'nombre y telefono son requeridos' }, { status: 400 });
  }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        correo: correo?.trim() ? correo.trim() : null,
        numeroAcompanantes: Number(numeroAcompanantes ?? acompanantes ?? 0) || 0,
        visitaMarcaEspecifica: Boolean(visitaMarcaEspecifica),
        marcaId: visitaMarcaEspecifica && marcaId ? Number(marcaId) : null,
        // Siempre la unidad del usuario que registra — un cliente queda
        // atado al dealer que lo atendió, no se elige libremente.
        unidadNegocioId: auth.usuario.unidadNegocioId,
        observaciones: observaciones?.trim() ? observaciones.trim() : null,
      },
      include: { marca: true },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'cliente', recursoId: cliente.id, detalle: cliente.nombre });
    return Response.json(cliente, { status: 201 });
  } catch (error) {
    if (error.code === 'P2003') {
      return Response.json({ error: 'La marca indicada no existe' }, { status: 400 });
    }
    throw error;
  }
}
