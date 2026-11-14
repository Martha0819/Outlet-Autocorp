import { prisma } from '@/lib/prisma';

// Whitelist de catálogos editables vía /api/catalogos/[tipo]. Cada tabla
// tiene forma distinta (algunas sin "activo", UnidadNegocio/Dependencia con
// FK), así que el CRUD genérico solo deja pasar los campos listados aquí —
// nunca el body completo del request a Prisma directo.
export const CATALOGOS = {
  marca: {
    model: prisma.marca,
    fields: ['nombre', 'activo'],
  },
  'linea-negocio': {
    model: prisma.lineaNegocio,
    fields: ['nombre', 'activo'],
  },
  'unidad-negocio': {
    model: prisma.unidadNegocio,
    fields: ['nombre', 'marcaId', 'activo'],
  },
  dependencia: {
    model: prisma.dependencia,
    fields: ['nombre', 'dependenciaPadreId', 'activo'],
  },
  'tipo-usuario': {
    model: prisma.tipoUsuario,
    fields: ['nombre', 'activo'],
  },
  // 'permiso' NO está aquí a propósito: desde que es una matriz
  // recurso×accion sembrada una vez, se gestiona con la vista de permisos
  // (/usuarios, subpestaña Permisos), no con el CRUD genérico de catálogos.
  turno: {
    model: prisma.turno,
    fields: ['nombre'],
  },
  etapa: {
    model: prisma.etapa,
    fields: ['nombre', 'orden', 'activo'],
  },
  'tipo-seguimiento': {
    model: prisma.tipoSeguimiento,
    fields: ['nombre'],
  },
};

export function getCatalogoConfig(tipo) {
  return CATALOGOS[tipo] ?? null;
}

export function pickAllowedFields(tipo, body) {
  const { fields } = getCatalogoConfig(tipo);
  const data = {};
  for (const field of fields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  return data;
}
