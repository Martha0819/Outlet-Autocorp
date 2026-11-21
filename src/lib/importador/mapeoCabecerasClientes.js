import { crearSugeridorMapeo } from './mapeoCabeceras';

// Mismos campos que pide el alta manual de Cliente (ver POST /api/clientes):
// todo lo propio del cliente, nada de Negocio o Demo — esos son otros
// modelos con su propio flujo, no datos que este importador toque.
const SINONIMOS_POR_CAMPO = {
  nombre: ['nombre', 'nombre del cliente', 'cliente', 'nombre completo'],
  telefono: ['telefono', 'celular', 'numero', 'numero de telefono', 'tel', 'no de telefono'],
  correo: ['correo', 'email', 'correo electronico', 'e mail', 'mail'],
  numeroAcompanantes: ['acompanantes', 'numero de acompanantes', 'num acompanantes', 'personas', 'numero de personas', 'no de acompanantes'],
  visitaMarcaEspecifica: ['visita marca especifica', 'visita una marca en especifico', 'marca especifica', 'visita marca'],
  marca: ['marca', 'marca de interes', 'brand'],
  observaciones: ['observaciones', 'comentarios', 'notas'],
};

export const sugerirMapeoClientes = crearSugeridorMapeo(SINONIMOS_POR_CAMPO);
