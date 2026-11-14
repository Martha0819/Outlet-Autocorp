import { prisma } from '@/lib/prisma';
import { requirePermiso } from '@/lib/auth/authorize';

export async function GET() {
  const auth = await requirePermiso('usuario', 'editar');
  if (auth.error) return auth.error;

  const [permisos, tiposUsuario, asignaciones] = await Promise.all([
    prisma.permiso.findMany({ orderBy: [{ recurso: 'asc' }, { accion: 'asc' }] }),
    prisma.tipoUsuario.findMany({ orderBy: { id: 'asc' } }),
    prisma.tipoUsuarioPermiso.findMany(),
  ]);

  return Response.json({ permisos, tiposUsuario, asignaciones });
}
