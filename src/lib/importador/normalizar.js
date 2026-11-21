export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Muchos archivos reales traen los números con formato: "$40,000.00
// DESCUENTO", "TARJETA GASOLINA $6,000.00". Number() sobre ese texto da NaN,
// y al insertarlo en un campo Decimal de Postgres la fila entera fallaba con
// un error genérico. Se extrae el primer número válido ignorando símbolos de
// moneda, separadores de miles y texto alrededor.
export function aNumero(valor) {
  if (valor === undefined || valor === null) return NaN;
  const texto = String(valor).trim();
  if (!texto) return NaN;
  const limpio = texto.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  // Number('') y Number('-') son 0, no NaN — sin ningún dígito no hay número
  // que extraer (ej. "TANQUE /TAPETES O PELICULA"), así que se trata como
  // ausente en vez de leerlo como cero.
  if (!/[0-9]/.test(limpio)) return NaN;
  return Number(limpio);
}

export function numeroOpcional(valor) {
  const numero = aNumero(valor);
  return Number.isFinite(numero) ? numero : null;
}

const VALORES_VERDADEROS = ['si', 'sí', 's', 'true', 'verdadero', '1', 'yes', 'x'];
const VALORES_FALSOS = ['no', 'n', 'false', 'falso', '0'];

// undefined = la columna no venía o estaba vacía (no se puede saber qué
// quiso decir quien llenó el archivo); true/false solo cuando el texto es
// reconocible como tal, para no adivinar con cualquier texto suelto.
export function aBooleanoOpcional(valor) {
  const texto = String(valor ?? '').trim().toLowerCase();
  if (!texto) return undefined;
  if (VALORES_VERDADEROS.includes(texto)) return true;
  if (VALORES_FALSOS.includes(texto)) return false;
  return undefined;
}
