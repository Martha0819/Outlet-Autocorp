import { prisma } from '@/lib/prisma';

// Lista "recurso.accion" asignada al tipoUsuario — se manda al cliente en
// login/verify para que la UI pueda ocultar botones/secciones sin tener que
// preguntarle al servidor por cada elemento. La fuente de verdad para
// bloquear sigue siendo el servidor (requirePermiso en cada ruta); esto es
// solo para que la UI no muestre controles que de todos modos van a fallar.
export async function getPermisosDeRol(tipoUsuarioId) {
  const asignados = await prisma.tipoUsuarioPermiso.findMany({
    where: { tipoUsuarioId },
    include: { permiso: true },
  });
  return asignados.map((a) => `${a.permiso.recurso}.${a.permiso.accion}`);
}
