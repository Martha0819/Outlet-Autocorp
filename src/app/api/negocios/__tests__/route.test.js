// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { limpiarBaseDePrueba, sembrarCatalogo } from '@/lib/importador/__tests__/testDb';
import { crearUsuarioDePrueba } from '@/lib/importador/__tests__/testAuth';

async function rutaConSesion(ruta, token) {
  vi.resetModules();
  vi.doMock('next/headers', () => ({
    cookies: async () => ({ get: (nombre) => (nombre === 'access_token' ? { value: token } : undefined) }),
  }));
  return import(ruta);
}

async function peticion(url, { method = 'GET', body } = {}) {
  return new Request(url, {
    method,
    ...(body ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
}

describe('POST/PATCH /api/negocios — estatus del vehículo vinculado', () => {
  let catalogo;
  let etapa;
  let tipoSeguimiento;

  async function crearVehiculo(overrides = {}) {
    return prisma.vehiculo.create({
      data: {
        nombre: 'Sentra',
        modelo: 'Sentra',
        anio: 2024,
        km: 0,
        marcaId: catalogo.nissan.id,
        unidadNegocioId: catalogo.matriz.id,
        precioLista: 300000,
        ...overrides,
      },
    });
  }

  beforeEach(async () => {
    await prisma.negocio.deleteMany();
    await prisma.etapa.deleteMany();
    await prisma.tipoSeguimiento.deleteMany();
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
    etapa = await prisma.etapa.create({ data: { nombre: `Prospecto-${Date.now()}`, orden: 1 } });
    tipoSeguimiento = await prisma.tipoSeguimiento.create({ data: { nombre: `Llamada-${Date.now()}` } });
  });

  afterEach(() => vi.doUnmock('next/headers'));

  afterAll(async () => {
    await prisma.negocio.deleteMany();
    await prisma.etapa.deleteMany();
    await prisma.tipoSeguimiento.deleteMany();
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('al crear con dioEnganche, el vehículo queda APARTADO y se audita en bitácora', async () => {
    const { token, usuario } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear']] });
    const vehiculo = await crearVehiculo();
    const cliente = await prisma.cliente.create({ data: { nombre: 'Cliente Uno', telefono: '5500000001', unidadNegocioId: catalogo.matriz.id } });

    const { POST } = await rutaConSesion('../route.js', token);
    const respuesta = await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, dioEnganche: true, enganche: 50000 },
    }));
    expect(respuesta.status).toBe(201);
    const negocio = await respuesta.json();

    const vehiculoActualizado = await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } });
    expect(vehiculoActualizado.estatus).toBe('APARTADO');

    const bitacoraVehiculo = await prisma.bitacora.findFirst({ where: { recurso: 'vehiculo', recursoId: vehiculo.id } });
    expect(bitacoraVehiculo).not.toBeNull();
    expect(bitacoraVehiculo.detalle).toContain(`negocio #${negocio.id}`);
  });

  it('al quitar el enganche (dioEnganche: false) en PATCH, el vehículo se libera a DISPONIBLE', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculo = await crearVehiculo();
    const cliente = await prisma.cliente.create({ data: { nombre: 'Cliente Dos', telefono: '5500000002', unidadNegocioId: catalogo.matriz.id } });

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, dioEnganche: true, enganche: 50000 },
    }))).json();

    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('APARTADO');

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    const respuestaPatch = await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { dioEnganche: false } }),
      { params: { id: String(creado.id) } }
    );
    expect(respuestaPatch.status).toBe(200);

    const vehiculoLiberado = await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } });
    expect(vehiculoLiberado.estatus).toBe('DISPONIBLE');

    const bitacoraLiberacion = await prisma.bitacora.findFirst({
      where: { recurso: 'vehiculo', recursoId: vehiculo.id, detalle: { contains: 'DISPONIBLE' } },
    });
    expect(bitacoraLiberacion).not.toBeNull();
  });

  it('al desvincular el vehículo del negocio (vehiculoId: null), el vehículo anterior se libera', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculo = await crearVehiculo();
    const cliente = await prisma.cliente.create({ data: { nombre: 'Cliente Tres', telefono: '5500000003', unidadNegocioId: catalogo.matriz.id } });

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, dioEnganche: true, enganche: 50000 },
    }))).json();

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { vehiculoId: null } }),
      { params: { id: String(creado.id) } }
    );

    const vehiculoLiberado = await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } });
    expect(vehiculoLiberado.estatus).toBe('DISPONIBLE');
  });

  it('deshacer una venta (totalUnidad: null) con enganche activo regresa a APARTADO, no a DISPONIBLE', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculo = await crearVehiculo();
    const cliente = await prisma.cliente.create({ data: { nombre: 'Cliente Cuatro', telefono: '5500000004', unidadNegocioId: catalogo.matriz.id } });

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, dioEnganche: true, enganche: 50000, totalUnidad: 300000 },
    }))).json();
    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('VENDIDO');

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { totalUnidad: null } }),
      { params: { id: String(creado.id) } }
    );

    const vehiculoActualizado = await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } });
    expect(vehiculoActualizado.estatus).toBe('APARTADO');
  });

  it('un PATCH que no toca vehiculoId/dioEnganche/totalUnidad no mueve el estatus ni genera bitácora extra', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculo = await crearVehiculo();
    const cliente = await prisma.cliente.create({ data: { nombre: 'Cliente Cinco', telefono: '5500000005', unidadNegocioId: catalogo.matriz.id } });

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, dioEnganche: true, enganche: 50000 },
    }))).json();

    const bitacoraAntes = await prisma.bitacora.count({ where: { recurso: 'vehiculo', recursoId: vehiculo.id } });

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { observaciones: 'seguimiento telefónico' } }),
      { params: { id: String(creado.id) } }
    );

    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('APARTADO');
    const bitacoraDespues = await prisma.bitacora.count({ where: { recurso: 'vehiculo', recursoId: vehiculo.id } });
    expect(bitacoraDespues).toBe(bitacoraAntes);
  });
});
