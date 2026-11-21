import { requirePermiso } from '@/lib/auth/authorize';
import { confirmarFilasClientes } from '@/lib/importador/confirmarImportacionClientes';

export async function POST(request) {
  const auth = await requirePermiso('cliente', 'crear');
  if (auth.error) return auth.error;

  const { mapeoFinal, filasDecididas } = await request.json();
  // Igual que el alta manual: la unidad de negocio siempre es la del
  // usuario que importa, nunca se elige por archivo.
  const usuarioActual = { id: auth.usuario.id, unidadNegocioId: auth.usuario.unidadNegocioId };

  const resumen = await confirmarFilasClientes({ mapeoFinal, filasDecididas, usuarioActual });
  return Response.json(resumen);
}
