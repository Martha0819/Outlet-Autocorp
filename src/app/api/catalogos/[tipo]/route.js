import { getCatalogoConfig, pickAllowedFields } from '@/lib/catalogos/config';
import { requirePermiso } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';

// Los catálogos nunca se paginan a propósito: son listas chicas de
// referencia que alimentan <select> en todo el resto de la app — ni
// siquiera soportan ?page= (a diferencia de usuarios/vehiculos/etc, que sí
// son opt-in). Si algún día un catálogo crece lo suficiente para necesitarlo,
// es una decisión aparte, no un efecto secundario de este endpoint.
export async function GET(_request, { params }) {
  const auth = await requirePermiso('catalogo', 'leer');
  if (auth.error) return auth.error;

  const config = getCatalogoConfig(params.tipo);
  if (!config) {
    return Response.json({ error: `Catálogo desconocido: ${params.tipo}` }, { status: 404 });
  }

  const items = await config.model.findMany({ orderBy: { id: 'asc' } });
  return Response.json(items);
}

export async function POST(request, { params }) {
  const auth = await requirePermiso('catalogo', 'crear');
  if (auth.error) return auth.error;

  const config = getCatalogoConfig(params.tipo);
  if (!config) {
    return Response.json({ error: `Catálogo desconocido: ${params.tipo}` }, { status: 404 });
  }

  const body = await request.json();
  const data = pickAllowedFields(params.tipo, body);

  if (!data.nombre) {
    return Response.json({ error: 'nombre es requerido' }, { status: 400 });
  }

  try {
    const item = await config.model.create({ data });
    await registrarBitacora({
      usuarioId: auth.usuario.id,
      accion: 'crear',
      recurso: `catalogo:${params.tipo}`,
      recursoId: item.id,
      detalle: data.nombre,
    });
    return Response.json(item, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Ya existe un registro con ese valor único (nombre/código)' }, { status: 409 });
    }
    throw error;
  }
}
