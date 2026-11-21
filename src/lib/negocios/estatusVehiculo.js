// Única fuente de verdad para el estatus que un negocio le impone a su
// vehículo vinculado. Se recalcula completo (nunca a medias) cada vez que
// algo relevante del negocio cambia, para que un enganche retirado o una
// venta deshecha liberen el vehículo en vez de dejarlo atascado.
export function estatusVehiculoParaNegocio({ totalUnidad, dioEnganche }) {
  if (totalUnidad !== undefined && totalUnidad !== null && totalUnidad !== '') return 'VENDIDO';
  if (dioEnganche) return 'APARTADO';
  return 'DISPONIBLE';
}
