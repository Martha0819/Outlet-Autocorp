// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { limpiarBaseDePrueba, sembrarCatalogo } from '@/lib/importador/__tests__/testDb';
import { crearUsuarioDePrueba } from '@/lib/importador/__tests__/testAuth';

const MAPEO_FINAL = [
  { columna: 'Modelo', campo: 'modelo' },
  { columna: 'Descripcion', campo: 'nombre' },
  { columna: 'Anio', campo: 'anio' },
  { columna: 'Transmision', campo: 'transmision' },
  { columna: 'Condicion', campo: 'condicion' },
  { columna: 'VIN', campo: 'vin' },
];

function filaBase(overrides = {}) {
  return {
    datosOriginales: { Modelo: 'Sentra', Descripcion: 'Auto seminuevo', Anio: '2020', Transmision: 'Automatica', Condicion: 'SEMINUEVO', VIN: 'VIN-E2E' },
    decision: 'importar',
    resueltoManualmente: false,
    ...overrides,
  };
}

async function peticion(body) {
  return new Request('http://localhost/api/importador-vehiculos/confirmar', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function rutaConSesion(token) {
  vi.resetModules();
  vi.doMock('next/headers', () => ({
    cookies: async () => ({ get: (nombre) => (nombre === 'access_token' ? { value: token } : undefined) }),
  }));
  return import('../route.js');
}

describe('POST /api/importador-vehiculos/confirmar', () => {
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

  it('con permiso, importa la fila de la propia unidad de negocio y devuelve el ResumenImportacion', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['vehiculo', 'crear']] });
    const { POST } = await rutaConSesion(token);

    const fila = filaBase({ marcaId: catalogo.nissan.id, unidadNegocioId: catalogo.matriz.id });
    const respuesta = await POST(await peticion({ mapeoFinal: MAPEO_FINAL, filasDecididas: [fila] }));
    const cuerpo = await respuesta.json();

    expect(respuesta.status).toBe(200);
    expect(cuerpo.importados.cuenta).toBe(1);
    expect(cuerpo.conError.cuenta).toBe(0);
  });

  it('un no-administrador con una fila de otra unidad de negocio: esa fila aparece como error, no se importa', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: false, unidadNegocioId: catalogo.sucursalNorte.id, permisos: [['vehiculo', 'crear']] });
    const { POST } = await rutaConSesion(token);

    const filaPropia = filaBase({ marcaId: catalogo.honda.id, unidadNegocioId: catalogo.sucursalNorte.id, datosOriginales: { ...filaBase().datosOriginales, VIN: 'VIN-PROPIA' } });
    const filaOtraUnidad = filaBase({ marcaId: catalogo.nissan.id, unidadNegocioId: catalogo.matriz.id, datosOriginales: { ...filaBase().datosOriginales, VIN: 'VIN-OTRA' } });

    const respuesta = await POST(await peticion({ mapeoFinal: MAPEO_FINAL, filasDecididas: [filaPropia, filaOtraUnidad] }));
    const cuerpo = await respuesta.json();

    expect(cuerpo.importados.cuenta).toBe(1);
    expect(cuerpo.conError.cuenta).toBe(1);
    expect(cuerpo.conError.lista[0].motivo).toMatch(/unidad de negocio/i);
  });

  it('sin el permiso vehiculo.crear, rechaza la petición', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: false, unidadNegocioId: catalogo.matriz.id, permisos: [] });
    const { POST } = await rutaConSesion(token);

    const respuesta = await POST(await peticion({ mapeoFinal: MAPEO_FINAL, filasDecididas: [filaBase({ marcaId: catalogo.nissan.id, unidadNegocioId: catalogo.matriz.id })] }));
    expect(respuesta.status).toBe(403);
  });
});
