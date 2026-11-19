import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { clasificarFilas } from '../resolucionCatalogo';
import { limpiarBaseDePrueba, sembrarCatalogo } from './testDb';

const MAPEO_BASE = [
  { columna: 'Modelo', campo: 'modelo' },
  { columna: 'Descripcion', campo: 'nombre' },
  { columna: 'Anio', campo: 'anio' },
  { columna: 'Marca', campo: 'marca' },
  { columna: 'UnidadNegocio', campo: 'unidadNegocio' },
  { columna: 'Transmision', campo: 'transmision' },
  { columna: 'Condicion', campo: 'condicion' },
  { columna: 'VIN', campo: 'vin' },
  { columna: 'PrecioLista', campo: 'precioLista' },
];

function filaBase(overrides = {}) {
  return {
    Modelo: 'Sentra',
    Descripcion: 'Auto seminuevo',
    Anio: '2020',
    Marca: 'Nissan',
    UnidadNegocio: 'Matriz',
    Transmision: 'Automática',
    Condicion: 'SEMINUEVO',
    VIN: '',
    PrecioLista: '250000',
    ...overrides,
  };
}

describe('clasificarFilas', () => {
  let catalogo;
  const administrador = { esAdministrador: true, unidadNegocioId: null };

  beforeEach(async () => {
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
  });

  afterAll(async () => {
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('marca una fila como "lista" cuando marca y unidad de negocio matchean exactamente (normalizado)', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Marca: '  nissan  ', UnidadNegocio: 'MATRIZ' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.marcaId).toBe(catalogo.nissan.id);
    expect(resultado.valoresResueltos.unidadNegocioId).toBe(catalogo.matriz.id);
  });

  it('marca una fila como "pendiente-marca" cuando la marca no coincide con nada del catálogo', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Marca: 'Nisan' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('pendiente-marca');
    expect(resultado.candidatosResolucion.map((c) => c.id)).toEqual(expect.arrayContaining([catalogo.nissan.id, catalogo.honda.id]));
    expect(resultado.unidadNegocioIdResuelto).toBe(catalogo.matriz.id);
  });

  it('marca una fila como "pendiente-unidadNegocio" cuando la unidad de negocio no coincide con nada del catálogo', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ UnidadNegocio: 'Sucursal Fantasma' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('pendiente-unidadNegocio');
    expect(resultado.marcaIdResuelto).toBe(catalogo.nissan.id);
  });

  it('nunca crea una marca o unidad de negocio nueva al clasificar', async () => {
    const [marcasAntes, unidadesAntes] = await Promise.all([prisma.marca.count(), prisma.unidadNegocio.count()]);

    await clasificarFilas({
      filas: [filaBase({ Marca: 'Nisan', UnidadNegocio: 'Sucursal Fantasma' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    const [marcasDespues, unidadesDespues] = await Promise.all([prisma.marca.count(), prisma.unidadNegocio.count()]);
    expect(marcasDespues).toBe(marcasAntes);
    expect(unidadesDespues).toBe(unidadesAntes);
  });

  it('marca una fila como "error" cuando falta un campo obligatorio', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Modelo: '' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/modelo/i);
  });

  it('marca una fila como "error" cuando el año no es numérico', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Anio: 'dos mil veinte' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/año/i);
  });

  it('no exige km, vin, precio sin iva, precio remate ni bono', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase()], // sin Km, VIN, PrecioSinIva, PrecioRemate ni Bono en el mapeo/datos
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.precioLista).toBe(250000);
    expect(resultado.valoresResueltos.precioSinIva).toBeNull();
    expect(resultado.valoresResueltos.precioRemate).toBeNull();
    expect(resultado.valoresResueltos.bono).toBeNull();
  });

  it('marca una fila como "error" cuando falta el precio de lista', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ PrecioLista: '' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/precio de lista/i);
  });

  it('marca una fila como "error" con motivo "VIN duplicado" cuando el VIN ya existe en el inventario', async () => {
    await prisma.vehiculo.create({
      data: {
        nombre: 'Ya existente', modelo: 'Sentra', anio: 2019, km: 0, vin: 'VIN123',
        transmision: 'Manual', condicion: 'SEMINUEVO', marcaId: catalogo.nissan.id, unidadNegocioId: catalogo.matriz.id,
      },
    });

    const [resultado] = await clasificarFilas({
      filas: [filaBase({ VIN: 'VIN123' })],
      mapeo: MAPEO_BASE,
      usuarioActual: administrador,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/vin duplicado/i);
  });

  it('marca una fila como "error" cuando un no-administrador importa a otra unidad de negocio', async () => {
    const noAdministrador = { esAdministrador: false, unidadNegocioId: catalogo.sucursalNorte.id };

    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Marca: 'Nissan', UnidadNegocio: 'Matriz' })], // matriz es de Nissan, no la suya
      mapeo: MAPEO_BASE,
      usuarioActual: noAdministrador,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/unidad de negocio/i);
  });

  it('permite a un no-administrador importar filas de su propia unidad de negocio', async () => {
    const noAdministrador = { esAdministrador: false, unidadNegocioId: catalogo.matriz.id };

    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Marca: 'Nissan', UnidadNegocio: 'Matriz' })],
      mapeo: MAPEO_BASE,
      usuarioActual: noAdministrador,
    });

    expect(resultado.estado).toBe('lista');
  });
});
