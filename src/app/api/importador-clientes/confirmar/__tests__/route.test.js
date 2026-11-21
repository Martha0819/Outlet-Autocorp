// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { limpiarBaseDePrueba, sembrarCatalogo } from '@/lib/importador/__tests__/testDb';
import { crearUsuarioDePrueba } from '@/lib/importador/__tests__/testAuth';

const MAPEO_FINAL = [
  { columna: 'Nombre', campo: 'nombre' },
  { columna: 'Celular', campo: 'telefono' },
];

function filaBase(overrides = {}) {
  return {
    datosOriginales: { Nombre: 'Cliente de prueba', Celular: '5500000000' },
    decision: 'importar',
    resueltoManualmente: false,
    ...overrides,
  };
}

async function peticion(body) {
  return new Request('http://localhost/api/importador-clientes/confirmar', {
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

describe('POST /api/importador-clientes/confirmar', () => {
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

  it('con permiso, importa la fila con la unidad de negocio del usuario que importa', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['cliente', 'crear']] });
    const { POST } = await rutaConSesion(token);

    const respuesta = await POST(await peticion({ mapeoFinal: MAPEO_FINAL, filasDecididas: [filaBase()] }));
    const cuerpo = await respuesta.json();

    expect(respuesta.status).toBe(200);
    expect(cuerpo.importados.cuenta).toBe(1);
    expect(cuerpo.conError.cuenta).toBe(0);

    const creado = await prisma.cliente.findFirst({ where: { nombre: 'Cliente de prueba' } });
    expect(creado.unidadNegocioId).toBe(catalogo.matriz.id);
  });

  it('sin el permiso cliente.crear, rechaza la petición', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: false, unidadNegocioId: catalogo.matriz.id, permisos: [] });
    const { POST } = await rutaConSesion(token);

    const respuesta = await POST(await peticion({ mapeoFinal: MAPEO_FINAL, filasDecididas: [filaBase()] }));
    expect(respuesta.status).toBe(403);
  });
});
