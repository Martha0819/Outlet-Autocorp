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

describe('POST/PATCH /api/negocios — tipo y estatus del vehículo vinculado', () => {
  let catalogo;
  let etapa;

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

  async function crearCliente(overrides = {}) {
    return prisma.cliente.create({
      data: { nombre: 'Cliente de prueba', telefono: `55${Date.now()}`.slice(0, 10), unidadNegocioId: catalogo.matriz.id, ...overrides },
    });
  }

  beforeEach(async () => {
    await prisma.negocio.deleteMany();
    await prisma.etapa.deleteMany();
    await prisma.tipoSeguimiento.deleteMany();
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
    etapa = await prisma.etapa.create({ data: { nombre: `Prospecto-${Date.now()}`, orden: 1 } });
  });

  afterEach(() => vi.doUnmock('next/headers'));

  afterAll(async () => {
    await prisma.negocio.deleteMany();
    await prisma.etapa.deleteMany();
    await prisma.tipoSeguimiento.deleteMany();
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('tipo SOLICITUD nunca aparta el vehículo — sigue DISPONIBLE', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear']] });
    const vehiculo = await crearVehiculo();
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const respuesta = await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'SOLICITUD' },
    }));
    expect(respuesta.status).toBe(201);
    const negocio = await respuesta.json();
    expect(negocio.tipo).toBe('SOLICITUD');

    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('DISPONIBLE');
  });

  it('tipo APARTADO deja el vehículo APARTADO y se audita en bitácora', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear']] });
    const vehiculo = await crearVehiculo();
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const respuesta = await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'APARTADO', enganche: 50000 },
    }));
    expect(respuesta.status).toBe(201);
    const negocio = await respuesta.json();
    expect(negocio.dioEnganche).toBe(true);

    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('APARTADO');
    const bitacoraVehiculo = await prisma.bitacora.findFirst({ where: { recurso: 'vehiculo', recursoId: vehiculo.id } });
    expect(bitacoraVehiculo).not.toBeNull();
    expect(bitacoraVehiculo.detalle).toContain(`negocio #${negocio.id}`);
  });

  it('tipo VENTA deja el vehículo VENDIDO', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear']] });
    const vehiculo = await crearVehiculo();
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'VENTA', totalUnidad: 300000 },
    }));

    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('VENDIDO');
  });

  it('sin tipo en el body, por compatibilidad cae a SOLICITUD (no aparta por accidente)', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear']] });
    const vehiculo = await crearVehiculo();
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const negocio = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id },
    }))).json();

    expect(negocio.tipo).toBe('SOLICITUD');
    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('DISPONIBLE');
  });

  it('no deja crear un negocio con un vehículo que ya está APARTADO', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear']] });
    const vehiculo = await crearVehiculo({ estatus: 'APARTADO' });
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const respuesta = await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'SOLICITUD' },
    }));

    expect(respuesta.status).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.error).toMatch(/no está disponible/i);
    expect(await prisma.negocio.count()).toBe(0);
  });

  it('al cambiar tipo de APARTADO a SOLICITUD en PATCH, el vehículo se libera a DISPONIBLE', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculo = await crearVehiculo();
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'APARTADO', enganche: 50000 },
    }))).json();
    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('APARTADO');

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    const respuestaPatch = await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { tipo: 'SOLICITUD' } }),
      { params: { id: String(creado.id) } }
    );
    expect(respuestaPatch.status).toBe(200);
    const negocioActualizado = await respuestaPatch.json();
    expect(negocioActualizado.dioEnganche).toBe(false);
    expect(negocioActualizado.enganche).toBeNull();

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
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'APARTADO', enganche: 50000 },
    }))).json();

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { vehiculoId: null } }),
      { params: { id: String(creado.id) } }
    );

    const vehiculoLiberado = await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } });
    expect(vehiculoLiberado.estatus).toBe('DISPONIBLE');
  });

  it('al cambiar de VENTA a APARTADO en PATCH, el vehículo pasa de VENDIDO a APARTADO (nunca directo a DISPONIBLE)', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculo = await crearVehiculo();
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'VENTA', totalUnidad: 300000 },
    }))).json();
    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('VENDIDO');

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { tipo: 'APARTADO', enganche: 50000 } }),
      { params: { id: String(creado.id) } }
    );

    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculo.id } })).estatus).toBe('APARTADO');
  });

  it('al editar el vehículo asignado a uno distinto ya APARTADO por otro negocio, rechaza con 400', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculoPropio = await crearVehiculo();
    const vehiculoOcupado = await crearVehiculo({ estatus: 'APARTADO' });
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculoPropio.id, tipo: 'SOLICITUD' },
    }))).json();

    const { PATCH } = await rutaConSesion('../[id]/route.js', token);
    const respuesta = await PATCH(
      await peticion(`http://localhost/api/negocios/${creado.id}`, { method: 'PATCH', body: { vehiculoId: vehiculoOcupado.id } }),
      { params: { id: String(creado.id) } }
    );

    expect(respuesta.status).toBe(400);
    expect((await prisma.vehiculo.findUnique({ where: { id: vehiculoPropio.id } })).estatus).toBe('DISPONIBLE');
  });

  it('editar un negocio sin tocar tipo/vehiculoId no mueve el estatus ni genera bitácora extra', async () => {
    const { token } = await crearUsuarioDePrueba({ esAdministrador: true, unidadNegocioId: catalogo.matriz.id, permisos: [['negocio', 'crear'], ['negocio', 'editar']] });
    const vehiculo = await crearVehiculo();
    const cliente = await crearCliente();

    const { POST } = await rutaConSesion('../route.js', token);
    const creado = await (await POST(await peticion('http://localhost/api/negocios', {
      method: 'POST',
      body: { clienteId: cliente.id, lineaNegocioId: catalogo.nuevos.id, etapaId: etapa.id, vehiculoId: vehiculo.id, tipo: 'APARTADO', enganche: 50000 },
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
