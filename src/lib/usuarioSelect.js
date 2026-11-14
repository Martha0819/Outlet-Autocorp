// Select reutilizable para nunca incluir passwordHash/tokenVersion cuando se
// trae un Usuario anidado (guardia.usuario, actividad.responsable, etc.).
// Ver también toPublicUsuario() en src/app/api/usuarios/route.js, que cubre
// el caso de Usuario como entidad raíz (ahí sí se puede usar include+omit
// porque se controla el objeto completo; aquí es más simple seleccionar).
export const USUARIO_PUBLIC_SELECT = {
  id: true,
  nombre: true,
  email: true,
  tipoUsuarioId: true,
  unidadNegocioId: true,
  activo: true,
};
