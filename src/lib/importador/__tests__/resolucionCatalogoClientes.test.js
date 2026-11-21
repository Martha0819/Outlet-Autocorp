import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { clasificarFilasClientes } from '../resolucionCatalogoClientes';
import { limpiarBaseDePrueba, sembrarCatalogo } from './testDb';

const MAPEO_BASE = [
  { columna: 'Nombre', campo: 'nombre' },
  { columna: 'Celular', campo: 'telefono' },
  { columna: 'Correo', campo: 'correo' },
  { columna: 'Acompanantes', campo: 'numeroAcompanantes' },
  { columna: 'VisitaMarca', campo: 'visitaMarcaEspecifica' },
  { columna: 'Marca', campo: 'marca' },
  { columna: 'Comentarios', campo: 'observaciones' },
];

function filaBase(overrides = {}) {
  return {
    Nombre: 'Juan Pérez',
    Celular: '5512345678',
    Correo: 'juan@correo.com',
    Acompanantes: '2',
    VisitaMarca: '',
    Marca: '',
    Comentarios: '',
    ...overrides,
  };
}

describe('clasificarFilasClientes', () => {
  let catalogo;

  beforeEach(async () => {
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
  });

  afterAll(async () => {
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('resuelve una fila completa sin marca como lista, con unidadNegocio fuera de esta resolución', async () => {
    const resultado = await clasificarFilasClientes({ filas: [filaBase()], mapeo: MAPEO_BASE });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].estado).toBe('lista');
    expect(resultado[0].valoresResueltos).toEqual({
      nombre: 'Juan Pérez',
      telefono: '5512345678',
      correo: 'juan@correo.com',
      numeroAcompanantes: 2,
      visitaMarcaEspecifica: false,
      marcaId: null,
      observaciones: null,
    });
  });

  it('marca falta: campo obligatorio faltante da error', async () => {
    const resultado = await clasificarFilasClientes({ filas: [filaBase({ Nombre: '' })], mapeo: MAPEO_BASE });
    expect(resultado[0].estado).toBe('error');
    expect(resultado[0].motivoError).toContain('nombre');
  });

  it('con marca reconocida, resuelve marcaId y visitaMarcaEspecifica true', async () => {
    const resultado = await clasificarFilasClientes({
      filas: [filaBase({ Marca: catalogo.nissan.nombre })],
      mapeo: MAPEO_BASE,
    });
    expect(resultado[0].estado).toBe('lista');
    expect(resultado[0].valoresResueltos.marcaId).toBe(catalogo.nissan.id);
    expect(resultado[0].valoresResueltos.visitaMarcaEspecifica).toBe(true);
  });

  it('con marca no reconocida, queda pendiente-marca con los candidatos', async () => {
    const resultado = await clasificarFilasClientes({
      filas: [filaBase({ Marca: 'Marca Inexistente' })],
      mapeo: MAPEO_BASE,
    });
    expect(resultado[0].estado).toBe('pendiente-marca');
    expect(resultado[0].candidatosResolucion.length).toBeGreaterThan(0);
  });

  it('VisitaMarca explícito en "no" ignora el texto de marca aunque venga lleno', async () => {
    const resultado = await clasificarFilasClientes({
      filas: [filaBase({ VisitaMarca: 'No', Marca: catalogo.nissan.nombre })],
      mapeo: MAPEO_BASE,
    });
    expect(resultado[0].estado).toBe('lista');
    expect(resultado[0].valoresResueltos.marcaId).toBeNull();
    expect(resultado[0].valoresResueltos.visitaMarcaEspecifica).toBe(false);
  });

  it('sin columna de acompañantes mapeada, default a 0', async () => {
    const resultado = await clasificarFilasClientes({
      filas: [filaBase({ Acompanantes: '' })],
      mapeo: MAPEO_BASE,
    });
    expect(resultado[0].valoresResueltos.numeroAcompanantes).toBe(0);
  });
});
