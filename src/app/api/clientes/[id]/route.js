import { prisma } from '@/lib/prisma';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

// Sin DELETE a propósito, mismo criterio que usuarios/vehiculos: un cliente
// puede tener Demo/Negocio ligados por historial. Cliente no tiene campo
// "activo" en el schema, así que por ahora no hay forma de "retirar" uno —
// si se necesita, es una decisión aparte (agregar el campo).
export async function PATCH(request, { params }) {
  const auth = await requirePermiso('cliente', 'editar');
  if (auth.error) return auth.error;

  const objetivo = await prisma.cliente.findUnique({ where: { id: Number(params.id) } });
  if (!objetivo) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  if (!esAdministrador(auth.usuario) && objetivo.unidadNegocioId !== auth.usuario.unidadNegocioId) {
    return Response.json({ error: 'No puedes editar clientes de otra unidad de negocio' }, { status: 403 });
  }

  const body = await request.json();
  const data = {};

  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.telefono !== undefined) data.telefono = body.telefono;
  if (body.correo !== undefined) data.correo = body.correo?.trim() ? body.correo.trim() : null;
  if (body.numeroAcompanantes !== undefined || body.acompanantes !== undefined) {
    data.numeroAcompanantes = Number(body.numeroAcompanantes ?? body.acompanantes ?? 0) || 0;
  }
  if (body.observaciones !== undefined) data.observaciones = body.observaciones?.trim() ? body.observaciones.trim() : null;
  if (body.visitaMarcaEspecifica !== undefined) {
    data.visitaMarcaEspecifica = Boolean(body.visitaMarcaEspecifica);
    data.marcaId = data.visitaMarcaEspecifica && body.marcaId ? Number(body.marcaId) : null;
  } else if (body.marcaId !== undefined) {
    data.marcaId = body.marcaId ? Number(body.marcaId) : null;
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id: Number(params.id) },
      data,
      include: { marca: true },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'editar', recurso: 'cliente', recursoId: cliente.id, detalle: JSON.stringify(Object.keys(data)) });
    return Response.json(cliente);
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    if (error.code === 'P2003') {
      return Response.json({ error: 'La marca indicada no existe' }, { status: 400 });
    }
    throw error;
  }
}
