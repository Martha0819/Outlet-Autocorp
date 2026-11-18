import Papa from 'papaparse';
import ExcelJS from 'exceljs';

const FORMATOS_SOPORTADOS = ['.csv', '.xlsx'];

function extensionDe(nombreArchivo) {
  const i = nombreArchivo.lastIndexOf('.');
  return i === -1 ? '' : nombreArchivo.slice(i).toLowerCase();
}

function filasDesdeMatriz(matriz) {
  const [cabeceras, ...resto] = matriz;
  if (!cabeceras || cabeceras.length === 0) return { cabeceras: [], filas: [] };
  const filas = resto
    .filter((fila) => fila.some((valor) => valor !== undefined && valor !== null && String(valor).trim() !== ''))
    .map((fila) =>
      Object.fromEntries(cabeceras.map((cabecera, i) => [cabecera, fila[i] !== undefined && fila[i] !== null ? String(fila[i]) : '']))
    );
  return { cabeceras, filas };
}

async function leerCsv(contenido) {
  const texto = contenido.toString('utf-8');
  const { data } = Papa.parse(texto, { skipEmptyLines: true });
  return filasDesdeMatriz(data);
}

async function leerXlsx(contenido) {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.load(contenido);
  const hoja = libro.worksheets[0];
  const matriz = [];
  hoja.eachRow((fila) => {
    matriz.push(fila.values.slice(1).map((v) => (v === undefined || v === null ? '' : v)));
  });
  return filasDesdeMatriz(matriz);
}

export async function parsearArchivo({ nombreArchivo, contenido }) {
  const extension = extensionDe(nombreArchivo || '');
  if (!FORMATOS_SOPORTADOS.includes(extension)) {
    return { tipo: 'FormatoNoSoportado' };
  }

  const { cabeceras, filas } = extension === '.csv' ? await leerCsv(contenido) : await leerXlsx(contenido);

  if (cabeceras.length === 0 || filas.length === 0) {
    return { tipo: 'ArchivoVacio' };
  }

  return { tipo: 'ok', cabeceras, filas };
}
