import { prisma } from '@/lib/prisma';
import { requirePermiso } from '@/lib/auth/authorize';
import { parsearArchivo } from '@/lib/importador/parseoArchivo';
import { sugerirMapeoClientes } from '@/lib/importador/mapeoCabecerasClientes';
import { clasificarFilasClientes } from '@/lib/importador/resolucionCatalogoClientes';

export async function POST(request) {
  const auth = await requirePermiso('cliente', 'crear');
  if (auth.error) return auth.error;

  const formData = await request.formData();
  const archivo = formData.get('archivo');
  if (!archivo) {
    return Response.json({ error: 'Falta el archivo a importar' }, { status: 400 });
  }
  const hoja = formData.get('hoja') || undefined;

  const contenido = Buffer.from(await archivo.arrayBuffer());
  const resultadoParseo = await parsearArchivo({ nombreArchivo: archivo.name, contenido, hoja });

  if (resultadoParseo.tipo === 'FormatoNoSoportado') {
    return Response.json({ error: 'Formato no soportado. Solo se aceptan archivos CSV o Excel (.xlsx).' }, { status: 400 });
  }
  if (resultadoParseo.tipo === 'ArchivoVacio') {
    return Response.json({ error: 'El archivo no tiene filas para importar.' }, { status: 400 });
  }
  // El archivo tiene varias hojas: nunca se combinan ni se adivina cuál usar.
  if (resultadoParseo.tipo === 'RequiereHoja') {
    return Response.json({ requiereHoja: true, hojas: resultadoParseo.hojas, hojaActiva: resultadoParseo.hojaActiva });
  }

  const mapeoSugerido = sugerirMapeoClientes(resultadoParseo.cabeceras);
  const filas = await clasificarFilasClientes({ filas: resultadoParseo.filas, mapeo: mapeoSugerido });

  const marcas = await prisma.marca.findMany();

  return Response.json({ mapeoSugerido, filas, catalogo: { marcas } });
}
