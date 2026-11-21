// La etapa del cliente ya no se elige a mano ni vive en un catálogo editable
// (ver decisión en 02-DOCS/wiki/sdd/decisions.md): se calcula siempre a
// partir de lo que de verdad pasó con ese cliente, para que nunca pueda
// quedar desincronizada con la realidad. Lead/Demo ocurren antes de que
// exista cualquier Negocio — por eso esto no vive en Negocio.etapaId.
export const ETAPAS_CLIENTE = ['LEAD', 'DEMO', 'APARTADO', 'VENTA'];

export const ETIQUETA_ETAPA_CLIENTE = {
  LEAD: 'Lead',
  DEMO: 'Demo realizada',
  APARTADO: 'Enganche',
  VENTA: 'Venta',
};

export function etapaDeCliente({ tieneDemo, tieneApartado, tieneVenta }) {
  if (tieneVenta) return 'VENTA';
  if (tieneApartado) return 'APARTADO';
  if (tieneDemo) return 'DEMO';
  return 'LEAD';
}

// Atajo para cuando ya se tienen las listas completas de demos/negocios del
// cliente (como en ClientesView), en vez de armar los 3 booleanos a mano.
export function etapaDeClientePorListas({ demos = [], negocios = [] }) {
  return etapaDeCliente({
    tieneDemo: demos.length > 0,
    tieneApartado: negocios.some((n) => n.tipo === 'APARTADO'),
    tieneVenta: negocios.some((n) => n.tipo === 'VENTA'),
  });
}
