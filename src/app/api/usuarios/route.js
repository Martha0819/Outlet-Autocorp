import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { requirePermiso, esAdministrador } from '@/lib/auth/authorize';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { parsePagination, buildPaginatedResponse } from '@/lib/pagination';

function toPublicUsuario(usuario) {
  const { passwordHash, tokenVersion, ...rest } = usuario;
  return rest;
}

export async function GET(request) {
  const auth = await requirePermiso('usuario', 'leer');
  if (auth.error) return auth.error;

  // Administrador ve todas las unidades; cualquier otro rol solo la suya.
  const where = esAdministrador(auth.usuario) ? {} : { unidadNegocioId: auth.usuario.unidadNegocioId };
  const pagination = parsePagination(request);

  if (!pagination) {
    const usuarios = await prisma.usuario.findMany({
      where,
      include: { tipoUsuario: true, unidadNegocio: true },
      orderBy: { id: 'asc' },
    });
    return Response.json(usuarios.map(toPublicUsuario));
  }

  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      include: { tipoUsuario: true, unidadNegocio: true },
      orderBy: { id: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.usuario.count({ where }),
  ]);
  return Response.json(buildPaginatedResponse(usuarios.map(toPublicUsuario), total, pagination));
}

export async function POST(request) {
  const auth = await requirePermiso('usuario', 'crear');
  if (auth.error) return auth.error;

  const body = await request.json();
  const { nombre, email, password, tipoUsuarioId } = body;
  // Un no-Administrador solo puede crear usuarios en SU propia unidad,
  // sin importar qué unidadNegocioId mande el body.
  const unidadNegocioId = esAdministrador(auth.usuario) ? body.unidadNegocioId : auth.usuario.unidadNegocioId;

  if (!nombre?.trim() || !email?.trim() || !password?.trim() || !tipoUsuarioId || !unidadNegocioId) {
    return Response.json(
      { error: 'nombre, email, password, tipoUsuarioId y unidadNegocioId son requeridos' },
      { status: 400 }
    );
  }

  try {
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash: await hashPassword(password),
        tipoUsuarioId: Number(tipoUsuarioId),
        unidadNegocioId: Number(unidadNegocioId),
      },
      include: { tipoUsuario: true, unidadNegocio: true },
    });
    await registrarBitacora({ usuarioId: auth.usuario.id, accion: 'crear', recurso: 'usuario', recursoId: usuario.id, detalle: usuario.email });
    return Response.json(toPublicUsuario(usuario), { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }
    throw error;
  }
}
