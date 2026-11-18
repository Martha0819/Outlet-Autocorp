import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { confirmarFilas } from '@/lib/importador/confirmarImportacion';

export async function POST(request) {
  const auth = await requirePermiso('vehiculo', 'crear');
  if (auth.error) return auth.error;

  const { mapeoFinal, filasDecididas } = await request.json();
  const usuarioActual = { esAdministrador: esAdministrador(auth.usuario), unidadNegocioId: auth.usuario.unidadNegocioId, id: auth.usuario.id };

  const resumen = await confirmarFilas({ mapeoFinal, filasDecididas, usuarioActual });
  return Response.json(resumen);
}
