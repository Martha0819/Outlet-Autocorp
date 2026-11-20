import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { confirmarFilas } from '../confirmarImportacion';
import { limpiarBaseDePrueba, sembrarCatalogo } from './testDb';

const MAPEO_BASE = [
  { columna: 'Modelo', campo: 'modelo' },
  { columna: 'Descripcion', campo: 'nombre' },
  { columna: 'Anio', campo: 'anio' },
  { columna: 'Transmision', campo: 'transmision' },
  { columna: 'VIN', campo: 'vin' },
  { columna: 'PrecioLista', campo: 'precioLista' },
];

function filaDecidida(catalogo, overrides = {}) {
  return {
    datosOriginales: { Modelo: 'Sentra', Descripcion: 'Auto seminuevo', Anio: '2020', Transmision: 'Automatica', VIN: '', PrecioLista: '250000' },
    decision: 'importar',
    marcaId: catalogo.nissan.id,
    unidadNegocioId: catalogo.matriz.id,
    resueltoManualmente: false,
    ...overrides,
  };
}

describe('confirmarFilas', () => {
  let catalogo;
  let administrador;

  beforeEach(async () => {
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
    const tipoAdmin = await prisma.tipoUsuario.create({ data: { nombre: 'Administrador' } });
    const usuario = await prisma.usuario.create({
      data: { nombre: 'Admin de prueba', email: `admin-${Date.now()}@test.local`, passwordHash: 'x', unidadNegocioId: catalogo.matriz.id, tipoUsuarioId: tipoAdmin.id },
    });
    administrador = { esAdministrador: true, unidadNegocioId: null, id: usuario.id };
  });

  afterAll(async () => {
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('camino feliz: crea los vehículos "importar" y registra bitácora por cada uno', async () => {
    const filas = [
      filaDecidida(catalogo, { datosOriginales: { ...filaDecidida(catalogo).datosOriginales, VIN: 'VIN-A' } }),
      filaDecidida(catalogo, { datosOriginales: { ...filaDecidida(catalogo).datosOriginales, Modelo: 'Civic', VIN: 'VIN-B' } }),
    ];

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: administrador });

    expect(resumen.importados.cuenta).toBe(2);
    expect(resumen.conError.cuenta).toBe(0);

    const vehiculos = await prisma.vehiculo.findMany();
    expect(vehiculos).toHaveLength(2);

    const bitacora = await prisma.bitacora.findMany({ where: { recurso: 'vehiculo', accion: 'crear' } });
    expect(bitacora).toHaveLength(2);
  });

  it('una fila que falla al confirmar (VIN duplicado) no revierte las demás filas ya creadas en la misma corrida', async () => {
    await prisma.vehiculo.create({
      data: { nombre: 'Ya existente', modelo: 'Sentra', anio: 2019, km: 0, vin: 'VIN-DUP', transmision: 'Manual', marcaId: catalogo.nissan.id, unidadNegocioId: catalogo.matriz.id },
    });

    const filas = [
      filaDecidida(catalogo, { datosOriginales: { ...filaDecidida(catalogo).datosOriginales, VIN: 'VIN-NUEVO' } }),
      filaDecidida(catalogo, { datosOriginales: { ...filaDecidida(catalogo).datosOriginales, Modelo: 'Civic', VIN: 'VIN-DUP' } }),
    ];

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: administrador });

    expect(resumen.importados.cuenta).toBe(1);
    expect(resumen.conError.cuenta).toBe(1);
    expect(resumen.conError.lista[0].motivo).toMatch(/vin duplicado/i);

    const vehiculos = await prisma.vehiculo.findMany();
    expect(vehiculos).toHaveLength(2); // el que ya existía + el nuevo importado
  });

  it('cuando todas las filas son descartadas o fallan, el resumen responde 0 importados y N con error, sin lanzar excepción', async () => {
    const filas = [
      { ...filaDecidida(catalogo), decision: 'descartar' },
      filaDecidida(catalogo, { datosOriginales: { ...filaDecidida(catalogo).datosOriginales, Modelo: '' } }), // inválida: falta modelo
    ];

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: administrador });

    expect(resumen.importados.cuenta).toBe(0);
    expect(resumen.conError.cuenta).toBe(1);

    const vehiculos = await prisma.vehiculo.findMany();
    expect(vehiculos).toHaveLength(0);
  });

  it('reporta en el resumen el motivo de una fila ya descartada desde el análisis (motivoDescartado)', async () => {
    const filas = [{ datosOriginales: { Modelo: '' }, decision: 'descartar', motivoDescartado: 'campo obligatorio faltante: modelo' }];

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: administrador });

    expect(resumen.conError.cuenta).toBe(1);
    expect(resumen.conError.lista[0].motivo).toBe('campo obligatorio faltante: modelo');
  });

  it('cuenta cuántas filas requirieron resolución manual', async () => {
    const filas = [
      filaDecidida(catalogo, { resueltoManualmente: true, datosOriginales: { ...filaDecidida(catalogo).datosOriginales, VIN: 'VIN-M' } }),
      filaDecidida(catalogo, { resueltoManualmente: false, datosOriginales: { ...filaDecidida(catalogo).datosOriginales, Modelo: 'Civic', VIN: 'VIN-N' } }),
    ];

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: administrador });

    expect(resumen.resueltosManualmente).toBe(1);
  });

  it('importa una fila y guarda el servicioId resuelto', async () => {
    const filas = [filaDecidida(catalogo, { servicioId: catalogo.nuevos.id, datosOriginales: { ...filaDecidida(catalogo).datosOriginales, VIN: 'VIN-SERVICIO' } })];

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: administrador });

    expect(resumen.importados.cuenta).toBe(1);
    expect(resumen.conError.cuenta).toBe(0);

    const vehiculo = await prisma.vehiculo.findUnique({ where: { vin: 'VIN-SERVICIO' } });
    expect(vehiculo.servicioId).toBe(catalogo.nuevos.id);
  });

  it('rechaza una fila "importar" sin precio de lista', async () => {
    const filas = [filaDecidida(catalogo, { datosOriginales: { ...filaDecidida(catalogo).datosOriginales, PrecioLista: '', VIN: 'VIN-SIN-PRECIO' } })];

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: administrador });

    expect(resumen.importados.cuenta).toBe(0);
    expect(resumen.conError.cuenta).toBe(1);
    expect(resumen.conError.lista[0].motivo).toMatch(/precio de lista/i);
  });

  it('rechaza una fila "importar" si el usuario no-administrador apunta a otra unidad de negocio', async () => {
    const tipoAsesor = await prisma.tipoUsuario.create({ data: { nombre: `Asesor ${Date.now()}` } });
    const usuarioNoAdmin = await prisma.usuario.create({
      data: { nombre: 'Asesor de prueba', email: `asesor-${Date.now()}@test.local`, passwordHash: 'x', unidadNegocioId: catalogo.sucursalNorte.id, tipoUsuarioId: tipoAsesor.id },
    });
    const noAdministrador = { esAdministrador: false, unidadNegocioId: catalogo.sucursalNorte.id, id: usuarioNoAdmin.id };
    const filas = [filaDecidida(catalogo)]; // unidadNegocioId = matriz, no la del usuario

    const resumen = await confirmarFilas({ mapeoFinal: MAPEO_BASE, filasDecididas: filas, usuarioActual: noAdministrador });

    expect(resumen.importados.cuenta).toBe(0);
    expect(resumen.conError.cuenta).toBe(1);
    expect(resumen.conError.lista[0].motivo).toMatch(/unidad de negocio/i);
  });
});
