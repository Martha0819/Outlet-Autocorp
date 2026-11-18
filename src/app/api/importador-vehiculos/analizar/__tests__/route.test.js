// @vitest-environment node
//
// Entorno node, no jsdom: `jose` firma/verifica con WebCrypto y, bajo jsdom,
// el Uint8Array que produce TextEncoder en Node no es `instanceof` el
// Uint8Array del realm de jsdom — falla la firma. Esta ruta no usa DOM.
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { limpiarBaseDePrueba, sembrarCatalogo } from '@/lib/importador/__tests__/testDb';
import { crearUsuarioDePrueba } from '@/lib/importador/__tests__/testAuth';

function archivoCsv(contenido, nombre = 'lote.csv') {
  return new File([contenido], nombre, { type: 'text/csv' });
}

async function peticionConArchivo(archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  return new Request('http://localhost/api/importador-vehiculos/analizar', { method: 'POST', body: formData });
}

async function importarRouteConSesion(token) {
  vi.resetModules();
  vi.doMock('next/headers', () => ({
    cookies: async () => ({ get: (nombre) => (nombre === 'access_token' ? { value: token } : undefined) }),
  }));
  return import('../route.js');
}

describe('POST /api/importador-vehiculos/analizar', () => {
  let catalogo;

  beforeEach(async () => {
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
  });

  afterEach(() => {
    vi.doUnmock('next/headers');
  });

  afterAll(async () => {
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('con permiso, devuelve el AnalisisImportacion (mapeo sugerido + filas clasificadas) y no persiste nada', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['vehiculo', 'crear']] });
    const { POST } = await importarRouteConSesion(token);

    const vehiculosAntes = await prisma.vehiculo.count();
    const csv = 'Modelo,Descripcion,Anio,Marca,UnidadNegocio,Transmision,Condicion\nSentra,Auto seminuevo,2020,Nissan,Matriz,Automatica,SEMINUEVO\n';
    const respuesta = await POST(await peticionConArchivo(archivoCsv(csv)));
    const cuerpo = await respuesta.json();

    expect(respuesta.status).toBe(200);
    expect(cuerpo.mapeoSugerido).toEqual(
      expect.arrayContaining([expect.objectContaining({ columna: 'Modelo', campo: 'modelo' })])
    );
    expect(cuerpo.filas).toHaveLength(1);
    expect(cuerpo.filas[0].estado).toBe('lista');

    const vehiculosDespues = await prisma.vehiculo.count();
    expect(vehiculosDespues).toBe(vehiculosAntes);
  });

  it('sin el permiso vehiculo.crear, rechaza la petición', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: false, unidadNegocioId: catalogo.matriz.id, permisos: [] });
    const { POST } = await importarRouteConSesion(token);

    const csv = 'Modelo,Descripcion,Anio,Marca,UnidadNegocio,Transmision,Condicion\nSentra,Auto seminuevo,2020,Nissan,Matriz,Automatica,SEMINUEVO\n';
    const respuesta = await POST(await peticionConArchivo(archivoCsv(csv)));

    expect(respuesta.status).toBe(403);
  });

  it('rechaza un formato no soportado', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['vehiculo', 'crear']] });
    const { POST } = await importarRouteConSesion(token);

    const respuesta = await POST(await peticionConArchivo(archivoCsv('cualquier cosa', 'lote.pdf')));
    expect(respuesta.status).toBe(400);
  });
});
