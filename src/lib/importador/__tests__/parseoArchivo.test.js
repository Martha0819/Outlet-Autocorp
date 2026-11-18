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
