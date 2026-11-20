import { normalizarTexto } from './normalizar';

const SINONIMOS_POR_CAMPO = {
  modelo: ['modelo'],
  nombre: ['descripcion', 'nombre'],
  anio: ['anio', 'ano', 'year'],
  km: ['km', 'kilometraje', 'kilometros'],
  vin: ['vin'],
  transmision: ['transmision'],
  marca: ['marca', 'brand'],
  servicio: ['unidad', 'linea de negocio', 'lineadenegocio', 'tipo de unidad', 'servicio'],
  precioSinIva: ['precio sin iva', 'preciosiniva', 'precio neto'],
  precioLista: ['precio de lista', 'preciolista', 'precio', 'price'],
  precioRemate: ['precio de remate', 'precio con remate', 'precioremate', 'remate'],
  bono: ['bono', 'bono si aplica'],
  diasInventario: ['dias en inventario', 'diasinventario', 'dias de inventario', 'dias inventario'],
};

function campoParaCabecera(cabecera) {
  const normalizada = normalizarTexto(cabecera);
  for (const [campo, sinonimos] of Object.entries(SINONIMOS_POR_CAMPO)) {
    if (sinonimos.some((s) => normalizarTexto(s) === normalizada)) return campo;
  }
  return null;
}

export function sugerirMapeo(cabeceras) {
  return cabeceras.map((columna) => ({ columna, campo: campoParaCabecera(columna) }));
}
