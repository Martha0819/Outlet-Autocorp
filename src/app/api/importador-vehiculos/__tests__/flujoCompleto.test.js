// @vitest-environment node
//
// "E2E" sin navegador (decisión registrada en decisions.md): encadena los dos
// endpoints reales contra la base de datos de prueba real, igual que haría un
// usuario subiendo un archivo y confirmando — sin pasar por la UI.
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { limpiarBaseDePrueba, sembrarCatalogo } from '@/lib/importador/__tests__/testDb';
import { crearUsuarioDePrueba } from '@/lib/importador/__tests__/testAuth';

function archivoCsv(contenido, nombre = 'lote.csv') {
  return new File([contenido], nombre, { type: 'text/csv' });
}

async function peticionAnalizar(archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  return new Request('http://localhost/api/importador-vehiculos/analizar', { method: 'POST', body: formData });
}

async function peticionConfirmar(body) {
  return new Request('http://localhost/api/importador-vehiculos/confirmar', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function rutasConSesion(token) {
  vi.resetModules();
  vi.doMock('next/headers', () => ({
    cookies: async () => ({ get: (nombre) => (nombre === 'access_token' ? { value: token } : undefined) }),
  }));
  const [analizar, confirmar] = await Promise.all([import('../analizar/route.js'), import('../confirmar/route.js')]);
  return { POST_analizar: analizar.POST, POST_confirmar: confirmar.POST };
}

// Construye las FilaDecidida a partir del AnalisisImportacion, igual que haría
// la pantalla de revisión: filas "lista" se importan tal cual (con la unidad
// de negocio elegida una sola vez para todo el archivo), el resto se
// descarta (ningún caso de este archivo necesita resolución manual).
function decidirFilas(analisis, unidadNegocioId) {
  return analisis.filas.map((fila) =>
    fila.estado === 'lista'
      ? { datosOriginales: fila.datosOriginales, decision: 'importar', marcaId: fila.valoresResueltos.marcaId, unidadNegocioId, resueltoManualmente: false }
      : { datosOriginales: fila.datosOriginales, decision: 'descartar', motivoDescartado: fila.motivoError }
  );
}

describe('flujo completo del importador (analizar → confirmar)', () => {
  let catalogo;

  beforeEach(async () => {
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
  });

  afterEach(() => vi.doUnmock('next/headers'));

  afterAll(async () => {
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('camino feliz: un CSV con cabeceras no estándar se analiza, se mapea y se confirma; el inventario y el resumen lo reflejan', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['vehiculo', 'crear']] });
    const { POST_analizar, POST_confirmar } = await rutasConSesion(token);

    const csv = 'Modelo,Descripcion,Año,Marca,Transmisión,Servicio,VIN,Precio\nSentra,Auto seminuevo,2020,Nissan,Automática,Seminuevos,VIN-FELIZ,250000\n';
    const analisis = await (await POST_analizar(await peticionAnalizar(archivoCsv(csv)))).json();

    // El mapeo sugerido reconoce cabeceras con acentos/mayúsculas distintas al catálogo.
    expect(analisis.mapeoSugerido.find((m) => m.columna === 'Año').campo).toBe('anio');
    expect(analisis.filas[0].estado).toBe('lista');

    const resumen = await (await POST_confirmar(await peticionConfirmar({ mapeoFinal: analisis.mapeoSugerido, filasDecididas: decidirFilas(analisis, catalogo.matriz.id) }))).json();

    expect(resumen.importados.cuenta).toBe(1);
    expect(resumen.conError.cuenta).toBe(0);

    const vehiculos = await prisma.vehiculo.findMany({ where: { vin: 'VIN-FELIZ' } });
    expect(vehiculos).toHaveLength(1);
    expect(vehiculos[0].modelo).toBe('Sentra');
  });

  it('camino mixto: fila válida + fila con VIN duplicado + fila con campo faltante → las válidas quedan en el inventario, las inválidas aparecen en el resumen con su motivo', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['vehiculo', 'crear']] });
    const { POST_analizar, POST_confirmar } = await rutasConSesion(token);

    await prisma.vehiculo.create({
      data: { nombre: 'Previo', modelo: 'Sentra', anio: 2018, km: 0, vin: 'VIN-YA-EXISTE', transmision: 'Manual', marcaId: catalogo.nissan.id, unidadNegocioId: catalogo.matriz.id, precioLista: 200000 },
    });

    const csv = [
      'Modelo,Descripcion,Anio,Marca,Transmision,VIN,Precio',
      'Civic,Auto nuevo,2021,Nissan,Automatica,VIN-VALIDA,300000',
      'Sentra,Auto repetido,2019,Nissan,Manual,VIN-YA-EXISTE,210000',
      ',Sin modelo,2020,Nissan,Automatica,VIN-SIN-MODELO,220000',
    ].join('\n') + '\n';

    const analisis = await (await POST_analizar(await peticionAnalizar(archivoCsv(csv)))).json();
    const resumen = await (await POST_confirmar(await peticionConfirmar({ mapeoFinal: analisis.mapeoSugerido, filasDecididas: decidirFilas(analisis, catalogo.matriz.id) }))).json();

    expect(resumen.importados.cuenta).toBe(1);
    expect(resumen.conError.cuenta).toBe(2);
    expect(resumen.conError.lista.some((f) => /vin duplicado/i.test(f.motivo))).toBe(true);
    expect(resumen.conError.lista.some((f) => /modelo/i.test(f.motivo))).toBe(true);

    const vehiculos = await prisma.vehiculo.findMany({ where: { vin: 'VIN-VALIDA' } });
    expect(vehiculos).toHaveLength(1);
  });
});
