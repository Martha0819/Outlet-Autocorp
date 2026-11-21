import { prisma } from '@/lib/prisma';
import { USUARIO_PUBLIC_SELECT } from '@/lib/usuarioSelect';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { parsePagination, buildPaginatedResponse } from '@/lib/pagination';

export async function GET(request) {
  const auth = await requirePermiso('demo', 'leer');
  if (auth.error) return auth.error;

  const esInvitado = auth.usuario?.tipoUsuario?.nombre === 'Invitado' || auth.usuario?.esInvitado;
  // Demo no tiene su propia unidadNegocioId: se infiere del vehículo usado
  // (el dealer donde físicamente ocurrió la prueba de manejo).
  const where = (esAdministrador(auth.usuario) || esInvitado) ? {} : { vehiculo: { unidadNegocioId: auth.usuario.unidadNegocioId } };
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
  const { clienteId, vehiculoId, fecha, horario, usuarioId, estado, observaciones } = body;

  if (!clienteId || !vehiculoId) {
    return Response.json({ error: 'clienteId y vehiculoId son requeridos' }, { status: 400 });
  }

  if (!esAdministrador(auth.usuario)) {
    const vehiculo = await prisma.vehiculo.findUnique({ where: { id: Number(vehiculoId) } });
    if (!vehiculo || vehiculo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
      return Response.json({ error: 'No puedes registrar una demo con un vehículo de otra unidad de negocio' }, { status: 403 });
    }
  }

  let finalFecha = new Date();
  if (fecha) {
    const timePart = horario && /^\d{2}:\d{2}$/.test(horario) ? `${horario}:00` : '12:00:00';
    finalFecha = new Date(`${fecha.slice(0, 10)}T${timePart}`);
    if (isNaN(finalFecha.getTime())) finalFecha = new Date();
  }

  const assignedUserId = usuarioId && !isNaN(Number(usuarioId)) ? Number(usuarioId) : auth.usuario.id;

  const notesArray = [];
  if (estado && estado !== 'Programada') {
    notesArray.push(`[Estado: ${estado}]`);
  }
  if (observaciones?.trim()) {
    notesArray.push(observaciones.trim());
  }
  const finalNotes = notesArray.length > 0 ? notesArray.join(' ') : null;

  try {
    const demo = await prisma.demo.create({
      data: {
        clienteId: Number(clienteId),
        vehiculoId: Number(vehiculoId),
        usuarioId: assignedUserId,
        fecha: finalFecha,
        observaciones: finalNotes,
      },
      include: {
        cliente: true,
        vehiculo: { include: { marca: true } },
        usuario: { select: USUARIO_PUBLIC_SELECT },
      },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'demo', recursoId: demo.id });
    return Response.json(demo, { status: 201 });
  } catch (error) {
    if (error.code === 'P2003') {
      return Response.json({ error: 'El cliente, vehículo o usuario indicado no existe' }, { status: 400 });
    }
    throw error;
  }
}
