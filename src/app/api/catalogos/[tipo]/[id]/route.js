import { getCatalogoConfig, pickAllowedFields } from '@/lib/catalogos/config';
import { requirePermiso } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

function isForeignKeyViolation(error) {
  if (error.code === 'P2003') return true;
  // PrismaClientUnknownRequestError no trae .code; el mensaje sí trae el
  // SQLSTATE y texto crudo de Postgres para restrict/foreign key violation.
  return /23001|23503|foreign key|violates.*constraint/i.test(error.message ?? '');
}

export async function GET(_request, { params }) {
  const auth = await requirePermiso('catalogo', 'leer');
  if (auth.error) return auth.error;

  const config = getCatalogoConfig(params.tipo);
  if (!config) {
    return Response.json({ error: `Catálogo desconocido: ${params.tipo}` }, { status: 404 });
  }

  const item = await config.model.findUnique({ where: { id: Number(params.id) } });
  if (!item) {
    return Response.json({ error: 'No encontrado' }, { status: 404 });
  }
  return Response.json(item);
}

export async function PATCH(request, { params }) {
  const auth = await requirePermiso('catalogo', 'editar');
  if (auth.error) return auth.error;

  const config = getCatalogoConfig(params.tipo);
  if (!config) {
    return Response.json({ error: `Catálogo desconocido: ${params.tipo}` }, { status: 404 });
  }

  const body = await request.json();
  const data = pickAllowedFields(params.tipo, body);

  try {
    const item = await config.model.update({ where: { id: Number(params.id) }, data });
    await registrarBitacora({
      usuarioId: auth.usuario.id,
      accion: 'editar',
      recurso: `catalogo:${params.tipo}`,
      recursoId: item.id,
      detalle: JSON.stringify(data),
    });
    return Response.json(item);
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return Response.json({ error: 'Ya existe un registro con ese valor único (nombre/código)' }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requirePermiso('catalogo', 'eliminar');
  if (auth.error) return auth.error;

  const config = getCatalogoConfig(params.tipo);
  if (!config) {
    return Response.json({ error: `Catálogo desconocido: ${params.tipo}` }, { status: 404 });
  }

  try {
    await config.model.delete({ where: { id: Number(params.id) } });
    await registrarBitacora({
      usuarioId: auth.usuario.id,
      accion: 'eliminar',
      recurso: `catalogo:${params.tipo}`,
      recursoId: Number(params.id),
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return Response.json({ error: 'No encontrado' }, { status: 404 });
    }
    if (isForeignKeyViolation(error)) {
      // Postgres aplica el RESTRICT nativamente y a veces Prisma deja pasar
      // el error crudo (código Postgres 23001/23503) sin mapearlo a su
      // P2003 — por eso se revisan ambos, no solo error.code === 'P2003'.
      return Response.json(
        { error: 'No se puede borrar: hay registros que dependen de este catálogo' },
        { status: 409 }
      );
    }
    throw error;
  }
}
