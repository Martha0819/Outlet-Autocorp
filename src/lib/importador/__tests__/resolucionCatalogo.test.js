import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { clasificarFilas } from '../resolucionCatalogo';
import { limpiarBaseDePrueba, sembrarCatalogo } from './testDb';

const MAPEO_BASE = [
  { columna: 'Modelo', campo: 'modelo' },
  { columna: 'Descripcion', campo: 'nombre' },
  { columna: 'Anio', campo: 'anio' },
  { columna: 'Marca', campo: 'marca' },
  { columna: 'Transmision', campo: 'transmision' },
  { columna: 'VIN', campo: 'vin' },
  { columna: 'PrecioLista', campo: 'precioLista' },
];

function filaBase(overrides = {}) {
  return {
    Modelo: 'Sentra',
    Descripcion: 'Auto seminuevo',
    Anio: '2020',
    Marca: 'Nissan',
    Transmision: 'Automática',
    VIN: '',
    PrecioLista: '250000',
    ...overrides,
  };
}

describe('clasificarFilas', () => {
  let catalogo;

  beforeEach(async () => {
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
  });

  afterAll(async () => {
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('marca una fila como "lista" cuando la marca matchea exactamente (normalizado)', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Marca: '  nissan  ' })],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.marcaId).toBe(catalogo.nissan.id);
  });

  it('marca una fila como "pendiente-marca" cuando la marca no coincide con nada del catálogo', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Marca: 'Nisan' })],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('pendiente-marca');
    expect(resultado.candidatosResolucion.map((c) => c.id)).toEqual(expect.arrayContaining([catalogo.nissan.id, catalogo.honda.id]));
  });

  it('nunca crea una marca nueva al clasificar', async () => {
    const marcasAntes = await prisma.marca.count();

    await clasificarFilas({
      filas: [filaBase({ Marca: 'Nisan' })],
      mapeo: MAPEO_BASE,
    });

    const marcasDespues = await prisma.marca.count();
    expect(marcasDespues).toBe(marcasAntes);
  });

  it('marca una fila como "error" cuando falta un campo obligatorio', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Modelo: '' })],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/modelo/i);
  });

  it('marca una fila como "error" cuando el año no es numérico', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Anio: 'dos mil veinte' })],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/año/i);
  });

  it('no exige km, vin, precio sin iva, precio remate ni bono', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase()], // sin Km, VIN, PrecioSinIva, PrecioRemate ni Bono en el mapeo/datos
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.precioLista).toBe(250000);
    expect(resultado.valoresResueltos.precioSinIva).toBeNull();
    expect(resultado.valoresResueltos.precioRemate).toBeNull();
    expect(resultado.valoresResueltos.bono).toBeNull();
    expect(resultado.valoresResueltos.diasInventario).toBeNull();
  });

  it('resuelve colorExterior y colorInterior cuando las columnas están mapeadas', async () => {
    const mapeoConColores = [
      ...MAPEO_BASE,
      { columna: 'ColorExt', campo: 'colorExterior' },
      { columna: 'ColorInt', campo: 'colorInterior' },
    ];
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ ColorExt: 'Blanco', ColorInt: 'Negro' })],
      mapeo: mapeoConColores,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.colorExterior).toBe('Blanco');
    expect(resultado.valoresResueltos.colorInterior).toBe('Negro');
  });

  it('sin columnas de color mapeadas, la fila queda "lista" con los colores en null', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase()],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.colorExterior).toBeNull();
    expect(resultado.valoresResueltos.colorInterior).toBeNull();
  });

  it('resuelve diasInventario como entero cuando la columna está mapeada', async () => {
    const mapeoConDias = [...MAPEO_BASE, { columna: 'DiasInventario', campo: 'diasInventario' }];
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ DiasInventario: '45' })],
      mapeo: mapeoConDias,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.diasInventario).toBe(45);
  });

  it('no exige transmision: una fila sin transmisión queda "lista" con transmision=null', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Transmision: '' })],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.transmision).toBeNull();
  });

  it('resuelve servicio contra el catálogo cuando la columna está mapeada y coincide', async () => {
    const mapeoConServicio = [...MAPEO_BASE, { columna: 'Unidad', campo: 'servicio' }];
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Unidad: ' nuevos ' })],
      mapeo: mapeoConServicio,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.servicioId).toBe(catalogo.nuevos.id);
  });

  it('marca una fila como "pendiente-servicio" cuando el valor no coincide con ningún servicio', async () => {
    const mapeoConServicio = [...MAPEO_BASE, { columna: 'Unidad', campo: 'servicio' }];
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ Unidad: 'Demo' })],
      mapeo: mapeoConServicio,
    });

    expect(resultado.estado).toBe('pendiente-servicio');
    expect(resultado.candidatosResolucion.map((c) => c.id)).toEqual(expect.arrayContaining([catalogo.nuevos.id, catalogo.seminuevos.id]));
    expect(resultado.marcaIdResuelto).toBe(catalogo.nissan.id);
  });

  it('sin columna de servicio mapeada, la fila queda "lista" con servicioId=null', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase()],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('lista');
    expect(resultado.valoresResueltos.servicioId).toBeNull();
  });

  it('marca una fila como "error" cuando falta el precio de lista', async () => {
    const [resultado] = await clasificarFilas({
      filas: [filaBase({ PrecioLista: '' })],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/precio de lista/i);
  });

  it('marca una fila como "error" con motivo "VIN duplicado" cuando el VIN ya existe en el inventario', async () => {
    await prisma.vehiculo.create({
      data: {
        nombre: 'Ya existente', modelo: 'Sentra', anio: 2019, km: 0, vin: 'VIN123',
        transmision: 'Manual', marcaId: catalogo.nissan.id, unidadNegocioId: catalogo.matriz.id,
      },
    });

    const [resultado] = await clasificarFilas({
      filas: [filaBase({ VIN: 'VIN123' })],
      mapeo: MAPEO_BASE,
    });

    expect(resultado.estado).toBe('error');
    expect(resultado.motivoError).toMatch(/vin duplicado/i);
  });
});
