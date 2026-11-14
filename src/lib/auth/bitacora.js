import { prisma } from '@/lib/prisma';

// Solo se llama desde escrituras (crear/editar/eliminar/login/logout), nunca
// desde lecturas — una fila por GET inundaría la tabla sin aportar nada.
export async function registrarBitacora({ usuarioId, accion, recurso, recursoId = null, detalle = null }) {
  try {
    await prisma.bitacora.create({
      data: { usuarioId, accion, recurso, recursoId, detalle },
    });
  } catch (error) {
    // La auditoría nunca debe tirar la petición real si falla.
    console.error('No se pudo registrar en bitácora:', error);
  }
}
