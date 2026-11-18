import { prisma } from '@/lib/prisma';
import { signAccessToken } from '@/lib/auth/jwt';

export async function crearUsuarioDePrueba({ esAdministrador = false, unidadNegocioId, permisos = [] } = {}) {
  const nombreTipo = esAdministrador ? 'Administrador' : `Asesor de prueba ${Date.now()}-${Math.random()}`;
  const tipoUsuario = await prisma.tipoUsuario.create({ data: { nombre: nombreTipo } });

  for (const [recurso, accion] of permisos) {
    const permiso = await prisma.permiso.upsert({
      where: { recurso_accion: { recurso, accion } },
      create: { nombre: `${recurso}.${accion}`, recurso, accion },
      update: {},
    });
    await prisma.tipoUsuarioPermiso.create({ data: { tipoUsuarioId: tipoUsuario.id, permisoId: permiso.id } });
  }

  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Usuario de prueba',
      email: `prueba-${Date.now()}-${Math.random()}@test.local`,
      passwordHash: 'no-se-usa-en-estas-pruebas',
      unidadNegocioId,
      tipoUsuarioId: tipoUsuario.id,
    },
    include: { tipoUsuario: true },
  });

  const token = await signAccessToken(usuario);
  return { usuario, token };
}
