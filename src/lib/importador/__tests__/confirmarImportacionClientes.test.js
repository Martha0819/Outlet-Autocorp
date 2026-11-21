// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { confirmarFilasClientes } from '../confirmarImportacionClientes';
import { limpiarBaseDePrueba, sembrarCatalogo } from './testDb';

const MAPEO_FINAL = [
  { columna: 'Nombre', campo: 'nombre' },
  { columna: 'Celular', campo: 'telefono' },
  { columna: 'Correo', campo: 'correo' },
];

function filaDecidida(overrides = {}) {
  return {
    datosOriginales: { Nombre: 'Ana López', Celular: '5587654321', Correo: 'ana@correo.com' },
    decision: 'importar',
    resueltoManualmente: false,
    marcaId: null,
    ...overrides,
  };
}

describe('confirmarFilasClientes', () => {
  let catalogo;
  let usuarioActual;

  beforeEach(async () => {
    await limpiarBaseDePrueba();
    catalogo = await sembrarCatalogo();
    const tipoUsuario = await prisma.tipoUsuario.create({ data: { nombre: `Rol-${Date.now()}` } });
    const usuario = await prisma.usuario.create({
      data: {
        nombre: 'Importador de prueba',
        email: `importador-${Date.now()}@test.local`,
        passwordHash: 'no-se-usa',
        unidadNegocioId: catalogo.matriz.id,
        tipoUsuarioId: tipoUsuario.id,
      },
    });
    usuarioActual = { id: usuario.id, unidadNegocioId: catalogo.matriz.id };
  });

  afterAll(async () => {
    await limpiarBaseDePrueba();
    await prisma.$disconnect();
  });

  it('crea el cliente con la unidad de negocio de quien importa, no una del archivo', async () => {
    const resumen = await confirmarFilasClientes({ mapeoFinal: MAPEO_FINAL, filasDecididas: [filaDecidida()], usuarioActual });

    expect(resumen.importados.cuenta).toBe(1);
    expect(resumen.importados.lista[0].unidadNegocioId).toBe(catalogo.matriz.id);
    expect(resumen.importados.lista[0].nombre).toBe('Ana López');
  });

  it('con marcaId resuelto, marca visitaMarcaEspecifica true', async () => {
    const resumen = await confirmarFilasClientes({
      mapeoFinal: MAPEO_FINAL,
      filasDecididas: [filaDecidida({ marcaId: catalogo.nissan.id })],
      usuarioActual,
    });
    expect(resumen.importados.lista[0].marcaId).toBe(catalogo.nissan.id);
    expect(resumen.importados.lista[0].visitaMarcaEspecifica).toBe(true);
  });

  it('fila descartada por el usuario no se importa ni cuenta como error sin motivo', async () => {
    const resumen = await confirmarFilasClientes({
      mapeoFinal: MAPEO_FINAL,
      filasDecididas: [filaDecidida({ decision: 'descartar' })],
      usuarioActual,
    });
    expect(resumen.importados.cuenta).toBe(0);
    expect(resumen.conError.cuenta).toBe(0);
  });

  it('fila sin nombre reporta error de campo obligatorio y no bloquea las demás', async () => {
    const resumen = await confirmarFilasClientes({
      mapeoFinal: MAPEO_FINAL,
      filasDecididas: [
        filaDecidida({ datosOriginales: { Nombre: '', Celular: '5500000000', Correo: '' } }),
        filaDecidida(),
      ],
      usuarioActual,
    });
    expect(resumen.conError.cuenta).toBe(1);
    expect(resumen.conError.lista[0].motivo).toContain('nombre');
    expect(resumen.importados.cuenta).toBe(1);
  });

  it('marcaId inválido (no existe) se reporta como error de esa fila sin tumbar el lote', async () => {
    const resumen = await confirmarFilasClientes({
      mapeoFinal: MAPEO_FINAL,
      filasDecididas: [filaDecidida({ marcaId: 999999 }), filaDecidida({ datosOriginales: { Nombre: 'Otro Cliente', Celular: '5511111111', Correo: '' } })],
      usuarioActual,
    });
    expect(resumen.conError.cuenta).toBe(1);
    expect(resumen.conError.lista[0].motivo).toBe('marca inválida');
    expect(resumen.importados.cuenta).toBe(1);
  });
});
