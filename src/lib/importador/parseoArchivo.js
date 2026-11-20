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

function nombreHojaActiva(libro) {
  const indiceActiva = libro.views?.[0]?.activeTab;
  if (typeof indiceActiva === 'number' && libro.worksheets[indiceActiva]) {
    return libro.worksheets[indiceActiva].name;
  }
  return libro.worksheets[0]?.name ?? null;
}

function matrizDeHoja(hoja) {
  const matriz = [];
  hoja.eachRow((fila) => {
    matriz.push(fila.values.slice(1).map((v) => (v === undefined || v === null ? '' : v)));
  });
  return matriz;
}

// Un .xlsx con varias pestañas nunca se adivina en silencio: si el archivo
// trae más de una hoja y no se indicó cuál usar, se devuelve la lista para
// que el usuario elija explícitamente — y cada hoja se analiza por separado
// (solo la elegida), nunca combinando varias en un mismo lote, para no
// cruzar datos de hojas distintas.
async function leerXlsx(contenido, hojaElegida) {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.load(contenido);

  if (libro.worksheets.length > 1 && !hojaElegida) {
    return { requiereHoja: true, hojas: libro.worksheets.map((h) => h.name), hojaActiva: nombreHojaActiva(libro) };
  }

  const hoja = hojaElegida ? libro.worksheets.find((h) => h.name === hojaElegida) : libro.worksheets[0];
  if (!hoja) {
    return { requiereHoja: true, hojas: libro.worksheets.map((h) => h.name), hojaActiva: nombreHojaActiva(libro) };
  }

  return { requiereHoja: false, ...filasDesdeMatriz(matrizDeHoja(hoja)) };
}

export async function parsearArchivo({ nombreArchivo, contenido, hoja }) {
  const extension = extensionDe(nombreArchivo || '');
  if (!FORMATOS_SOPORTADOS.includes(extension)) {
    return { tipo: 'FormatoNoSoportado' };
  }

  if (extension === '.csv') {
    const { cabeceras, filas } = await leerCsv(contenido);
    if (cabeceras.length === 0 || filas.length === 0) return { tipo: 'ArchivoVacio' };
    return { tipo: 'ok', cabeceras, filas };
  }

  const resultado = await leerXlsx(contenido, hoja);
  if (resultado.requiereHoja) {
    return { tipo: 'RequiereHoja', hojas: resultado.hojas, hojaActiva: resultado.hojaActiva };
  }
  if (resultado.cabeceras.length === 0 || resultado.filas.length === 0) {
    return { tipo: 'ArchivoVacio' };
  }
  return { tipo: 'ok', cabeceras: resultado.cabeceras, filas: resultado.filas };
}
