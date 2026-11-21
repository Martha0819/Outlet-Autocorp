import { normalizarTexto } from './normalizar';

const SINONIMOS_POR_CAMPO = {
  modelo: ['modelo'],
  nombre: ['descripcion', 'nombre'],
  anio: ['anio', 'ano', 'year'],
  km: ['km', 'kilometraje', 'kilometros'],
  vin: ['vin', 'numero de serie', 'no de serie', 'numero serie', 'no serie', 'serie'],
  transmision: ['transmision'],
  colorExterior: ['color ext', 'color exterior', 'colorext', 'colorexterior'],
  colorInterior: ['color int', 'color interior', 'colorint', 'colorinterior'],
  marca: ['marca', 'brand'],
  servicio: ['unidad', 'linea de negocio', 'lineadenegocio', 'tipo de unidad', 'servicio'],
  precioSinIva: ['precio sin iva', 'preciosiniva', 'precio neto', 'precio de costo', 'precio costo', 'costo', 'costo sin iva'],
  precioLista: ['precio de lista', 'preciolista', 'precio', 'price', 'precio publico', 'precio de venta'],
  precioRemate: ['precio de remate', 'precio con remate', 'precioremate', 'remate', 'precio final remate', 'precio final de remate'],
  bono: ['bono', 'bono si aplica', 'bono outlet'],
  diasInventario: ['dias en inventario', 'diasinventario', 'dias de inventario', 'dias inventario'],
};

function campoParaCabecera(cabecera, sinonimosPorCampo) {
  const normalizada = normalizarTexto(cabecera);
  for (const [campo, sinonimos] of Object.entries(sinonimosPorCampo)) {
    if (sinonimos.some((s) => normalizarTexto(s) === normalizada)) return campo;
  }
  return null;
}

// Cada importador (vehículos, clientes...) tiene su propio diccionario de
// sinónimos, pero la lógica de reconocer una cabecera es la misma — se
// comparte vía esta fábrica en vez de reescribirla por importador.
export function crearSugeridorMapeo(sinonimosPorCampo) {
  return function sugerirMapeo(cabeceras) {
    return cabeceras.map((columna) => ({ columna, campo: campoParaCabecera(columna, sinonimosPorCampo) }));
  };
}

export const sugerirMapeo = crearSugeridorMapeo(SINONIMOS_POR_CAMPO);
