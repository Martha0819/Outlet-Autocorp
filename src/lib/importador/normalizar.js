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
