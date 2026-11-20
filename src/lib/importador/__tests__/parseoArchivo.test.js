import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { parsearArchivo } from '../parseoArchivo';

async function construirXlsx(filas) {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Vehiculos');
  filas.forEach((fila) => hoja.addRow(fila));
  const buffer = await libro.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

describe('parsearArchivo', () => {
  it('lee un CSV válido y devuelve cabeceras + filas', async () => {
    const contenido = Buffer.from('Modelo,Descripcion,Anio\nSentra,Auto seminuevo,2020\n', 'utf-8');
    const resultado = await parsearArchivo({ nombreArchivo: 'lote.csv', contenido });

    expect(resultado.tipo).toBe('ok');
    expect(resultado.cabeceras).toEqual(['Modelo', 'Descripcion', 'Anio']);
    expect(resultado.filas).toEqual([{ Modelo: 'Sentra', Descripcion: 'Auto seminuevo', Anio: '2020' }]);
  });

  it('lee un XLSX válido y devuelve cabeceras + filas', async () => {
    const contenido = await construirXlsx([
      ['Modelo', 'Descripcion', 'Anio'],
      ['Civic', 'Auto nuevo', '2021'],
    ]);
    const resultado = await parsearArchivo({ nombreArchivo: 'lote.xlsx', contenido });

    expect(resultado.tipo).toBe('ok');
    expect(resultado.cabeceras).toEqual(['Modelo', 'Descripcion', 'Anio']);
    expect(resultado.filas).toEqual([{ Modelo: 'Civic', Descripcion: 'Auto nuevo', Anio: '2021' }]);
  });

  it('rechaza un formato no soportado sin intentar leer el contenido', async () => {
    // contenido deliberadamente ilegible: si el parseo lo intentara leer, lanzaría.
    const contenido = Buffer.from([0x00, 0xff, 0x13, 0x37]);
    const resultado = await parsearArchivo({ nombreArchivo: 'lote.pdf', contenido });

    expect(resultado.tipo).toBe('FormatoNoSoportado');
  });

  it('indica archivo vacío cuando el CSV no tiene filas de datos', async () => {
    const contenido = Buffer.from('Modelo,Descripcion,Anio\n', 'utf-8');
    const resultado = await parsearArchivo({ nombreArchivo: 'lote.csv', contenido });

    expect(resultado.tipo).toBe('ArchivoVacio');
  });

  async function construirXlsxMultihoja() {
    const libro = new ExcelJS.Workbook();
    const plantillaVieja = libro.addWorksheet('Plantilla');
    plantillaVieja.addRow(['#', 'VIN', 'VERSION', 'COMENTARIOS']);
    plantillaVieja.addRow(['1', 'VIEJO123', 'Sentra viejo', '']);
    const hojaReal = libro.addWorksheet('Noviembre');
    hojaReal.addRow(['Modelo', 'Numero de serie', 'Anio']);
    hojaReal.addRow(['Civic', 'REAL456', '2026']);
    // La pestaña activa al guardar es la segunda (índice 1), no la primera.
    libro.views = [{ activeTab: 1 }];
    return Buffer.from(await libro.xlsx.writeBuffer());
  }

  it('con varias hojas y ninguna elegida, nunca adivina: pide elegir y nunca mezcla sus filas', async () => {
    const contenido = await construirXlsxMultihoja();

    const resultado = await parsearArchivo({ nombreArchivo: 'lote.xlsx', contenido });

    expect(resultado.tipo).toBe('RequiereHoja');
    expect(resultado.hojas).toEqual(['Plantilla', 'Noviembre']);
    expect(resultado.hojaActiva).toBe('Noviembre');
  });

  it('con varias hojas y una elegida explícitamente, analiza solo esa hoja', async () => {
    const contenido = await construirXlsxMultihoja();

    const resultado = await parsearArchivo({ nombreArchivo: 'lote.xlsx', contenido, hoja: 'Noviembre' });

    expect(resultado.tipo).toBe('ok');
    expect(resultado.cabeceras).toEqual(['Modelo', 'Numero de serie', 'Anio']);
    expect(resultado.filas).toEqual([{ Modelo: 'Civic', 'Numero de serie': 'REAL456', Anio: '2026' }]);
  });

  it('con varias hojas, elegir la otra hoja trae solo sus propias filas, sin mezclar', async () => {
    const contenido = await construirXlsxMultihoja();

    const resultado = await parsearArchivo({ nombreArchivo: 'lote.xlsx', contenido, hoja: 'Plantilla' });

    expect(resultado.tipo).toBe('ok');
    expect(resultado.cabeceras).toEqual(['#', 'VIN', 'VERSION', 'COMENTARIOS']);
    expect(resultado.filas).toEqual([{ '#': '1', VIN: 'VIEJO123', VERSION: 'Sentra viejo', COMENTARIOS: '' }]);
  });

  it('indica archivo vacío cuando el XLSX no tiene filas de datos', async () => {
    const contenido = await construirXlsx([['Modelo', 'Descripcion', 'Anio']]);
    const resultado = await parsearArchivo({ nombreArchivo: 'lote.xlsx', contenido });

    expect(resultado.tipo).toBe('ArchivoVacio');
  });

  it('indica archivo vacío cuando el archivo CSV no tiene ni cabeceras', async () => {
    const contenido = Buffer.from('', 'utf-8');
    const resultado = await parsearArchivo({ nombreArchivo: 'lote.csv', contenido });

    expect(resultado.tipo).toBe('ArchivoVacio');
  });
});
