export const TIPOS_NEGOCIO = ['SOLICITUD', 'APARTADO', 'VENTA'];

// Única fuente de verdad para el estatus que un negocio le impone a su
// vehículo vinculado, a partir del tipo explícito del negocio (no de
// adivinar por dioEnganche/totalUnidad). Se recalcula completo (nunca a
// medias) cada vez que algo relevante del negocio cambia, para que un
// enganche retirado o una venta deshecha liberen el vehículo en vez de
// dejarlo atascado.
//
// SOLICITUD nunca aparta la unidad: solo registra interés/trámite de
// crédito, el vehículo sigue DISPONIBLE y puede asignarse a otro cliente.
export function estatusVehiculoParaNegocio({ tipo }) {
  if (tipo === 'VENTA') return 'VENDIDO';
  if (tipo === 'APARTADO') return 'APARTADO';
  return 'DISPONIBLE';
}
