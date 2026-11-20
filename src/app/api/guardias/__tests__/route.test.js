// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { limpiarBaseDePrueba, sembrarCatalogo } from '@/lib/importador/__tests__/testDb';
import { crearUsuarioDePrueba } from '@/lib/importador/__tests__/testAuth';

function peticion(body) {
  return new Request('http://localhost/api/guardias', {
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

describe('POST /api/guardias', () => {
  let catalogo;

  beforeEach(async () => {
    await prisma.guardia.deleteMany();
    await prisma.turno.deleteMany();
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
  });

  afterEach(() => vi.doUnmock('next/headers'));

  afterAll(async () => {
    await prisma.guardia.deleteMany();
    await prisma.turno.deleteMany();
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('con un turnoId que no existe, responde 400 en vez de reventar con un 500', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id });
    const { POST } = await rutaConSesion(token);

    const respuesta = await POST(peticion({
      asesorNombre: 'Asesor de prueba',
      fecha: '2026-11-20',
      turnoId: 999999,
    }));

    expect(respuesta.status).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.error).toBeTruthy();
  });

  it('con usuarioId que no existe, responde 400 en vez de reventar con un 500', async () => {
    const turno = await prisma.turno.create({ data: { nombre: `Matutino-${Date.now()}` } });
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id });
    const { POST } = await rutaConSesion(token);

    const respuesta = await POST(peticion({
      usuarioId: 999999,
      fecha: '2026-11-20',
      turnoId: turno.id,
    }));

    expect(respuesta.status).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.error).toBeTruthy();
  });

  it('con datos válidos, crea la guardia y devuelve 201', async () => {
    const turno = await prisma.turno.create({ data: { nombre: `Vespertino-${Date.now()}` } });
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['guardia', 'crear']] });
    const { POST } = await rutaConSesion(token);

    const respuesta = await POST(peticion({
      asesorNombre: 'Asesor OK',
      fecha: '2026-11-20',
      fechaFin: '2026-11-22',
      turnoId: turno.id,
    }));

    expect(respuesta.status).toBe(201);
    const guardia = await respuesta.json();
    expect(guardia.asesorNombre).toBe('Asesor OK');
    expect(guardia.fechaFin).toBeTruthy();
  });
});
