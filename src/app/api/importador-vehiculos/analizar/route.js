import { prisma } from '@/lib/prisma';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { parsearArchivo } from '@/lib/importador/parseoArchivo';
import { sugerirMapeo } from '@/lib/importador/mapeoCabeceras';
import { clasificarFilas } from '@/lib/importador/resolucionCatalogo';

export async function POST(request) {
  const auth = await requirePermiso('vehiculo', 'crear');
  if (auth.error) return auth.error;

  const formData = await request.formData();
  const archivo = formData.get('archivo');
  if (!archivo) {
    return Response.json({ error: 'Falta el archivo a importar' }, { status: 400 });
  }

  const contenido = Buffer.from(await archivo.arrayBuffer());
  const resultadoParseo = await parsearArchivo({ nombreArchivo: archivo.name, contenido });

  if (resultadoParseo.tipo === 'FormatoNoSoportado') {
    return Response.json({ error: 'Formato no soportado. Solo se aceptan archivos CSV o Excel (.xlsx).' }, { status: 400 });
  }
  if (resultadoParseo.tipo === 'ArchivoVacio') {
    return Response.json({ error: 'El archivo no tiene filas para importar.' }, { status: 400 });
  }

  const mapeoSugerido = sugerirMapeo(resultadoParseo.cabeceras);
  const filas = await clasificarFilas({ filas: resultadoParseo.filas, mapeo: mapeoSugerido });

  // Se incluye el catálogo completo (no solo los candidatos de la fila) porque
  // una fila "pendiente-marca" puede tener varios candidatos para elegir.
  const [marcas, unidadesNegocio, lineasNegocio] = await Promise.all([
    prisma.marca.findMany(),
    prisma.unidadNegocio.findMany(),
    prisma.lineaNegocio.findMany(),
  ]);

  // La unidad de negocio es una sola para todo el archivo (no varía por
  // fila): la pantalla de revisión la pide una vez, bloqueada a la propia
  // si el usuario no es administrador.
  const usuarioActual = { esAdministrador: esAdministrador(auth.usuario), unidadNegocioId: auth.usuario.unidadNegocioId };

  return Response.json({ mapeoSugerido, filas, catalogo: { marcas, unidadesNegocio, lineasNegocio }, usuarioActual });
}
