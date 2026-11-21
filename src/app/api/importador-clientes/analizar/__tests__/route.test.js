// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { limpiarBaseDePrueba, sembrarCatalogo } from '@/lib/importador/__tests__/testDb';
import { crearUsuarioDePrueba } from '@/lib/importador/__tests__/testAuth';

function archivoCsv(contenido, nombre = 'clientes.csv') {
  return new File([contenido], nombre, { type: 'text/csv' });
}

async function peticionConArchivo(archivo) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  return new Request('http://localhost/api/importador-clientes/analizar', { method: 'POST', body: formData });
}

async function rutaConSesion(token) {
  vi.resetModules();
  vi.doMock('next/headers', () => ({
    cookies: async () => ({ get: (nombre) => (nombre === 'access_token' ? { value: token } : undefined) }),
  }));
  return import('../route.js');
}

describe('POST /api/importador-clientes/analizar', () => {
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

  it('con permiso, clasifica las filas y no persiste nada ni pide unidad de negocio', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['cliente', 'crear']] });
    const { POST } = await rutaConSesion(token);

    const csv = 'Nombre,Celular,Correo\nJuan Perez,5512345678,juan@correo.com\n';
    const respuesta = await POST(await peticionConArchivo(archivoCsv(csv)));
    expect(respuesta.status).toBe(200);

    const cuerpo = await respuesta.json();
    expect(cuerpo.filas).toHaveLength(1);
    expect(cuerpo.filas[0].estado).toBe('lista');
    expect(cuerpo.catalogo.marcas.length).toBeGreaterThan(0);
    expect(cuerpo.catalogo.unidadesNegocio).toBeUndefined();

    expect(await prisma.cliente.count()).toBe(0);
  });

  it('sin permiso, responde con error de autorización', async () => {
    const { token } = await crearUsuarioDePrueba({ unidadNegocioId: catalogo.matriz.id });
    const { POST } = await rutaConSesion(token);

    const respuesta = await POST(await peticionConArchivo(archivoCsv('Nombre,Celular\nJuan,555\n')));
    expect(respuesta.status).toBe(403);
  });
});
