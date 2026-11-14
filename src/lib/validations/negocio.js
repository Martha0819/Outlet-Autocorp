/**
 * Regla de negocio que Postgres/Prisma no expresan como constraint nativo:
 * ver prisma/schema.prisma (comentario sobre Negocio.dioEnganche/enganche).
 */
export function validarEnganche({ dioEnganche, enganche }) {
  if (dioEnganche) {
    if (!(Number(enganche) > 0)) {
      throw new Error('Si dioEnganche es true, enganche debe ser mayor a 0.');
    }
    return;
  }

  if (enganche !== null && enganche !== undefined && Number(enganche) !== 0) {
    throw new Error('Si dioEnganche es false, enganche debe quedar en NULL.');
  }
}
