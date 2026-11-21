import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAccessCookie, setRefreshCookie, ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/auth/cookies';
import { getAuthConfig } from '@/lib/auth/config';

async function getOrCreateGuestSession() {
  // 1. Asegurar el rol 'Invitado' en la base de datos
  let tipoInvitado = await prisma.tipoUsuario.findUnique({
    where: { nombre: 'Invitado' },
  });

  if (!tipoInvitado) {
    tipoInvitado = await prisma.tipoUsuario.create({
      data: {
        nombre: 'Invitado',
        activo: true,
      },
    });
  }

  // 2. Asignar los permisos exclusivos de solo lectura: vehiculo.leer, guardia.leer, actividad.leer, cliente.leer, demo.leer
  const permisosDeseados = [
    { recurso: 'vehiculo', accion: 'leer' },
    { recurso: 'guardia', accion: 'leer' },
    { recurso: 'actividad', accion: 'leer' },
    { recurso: 'cliente', accion: 'leer' },
    { recurso: 'demo', accion: 'leer' },
  ];

  for (const p of permisosDeseados) {
    const permisoRecord = await prisma.permiso.findUnique({
      where: { recurso_accion: { recurso: p.recurso, accion: p.accion } },
    });
    if (permisoRecord) {
      await prisma.tipoUsuarioPermiso.upsert({
        where: {
          tipoUsuarioId_permisoId: {
            tipoUsuarioId: tipoInvitado.id,
            permisoId: permisoRecord.id,
          },
        },
        update: {},
        create: {
          tipoUsuarioId: tipoInvitado.id,
          permisoId: permisoRecord.id,
        },
      });
    }
  }

  // 3. Asegurar el usuario 'invitado@autocorp.mx'
  let guestUser = await prisma.usuario.findUnique({
    where: { email: 'invitado@autocorp.mx' },
    include: { tipoUsuario: true },
  });

  if (!guestUser) {
    let unidad = await prisma.unidadNegocio.findFirst();
    if (!unidad) {
      let marca = await prisma.marca.findFirst();
      if (!marca) marca = await prisma.marca.create({ data: { nombre: 'Corporativo' } });
      unidad = await prisma.unidadNegocio.create({ data: { nombre: 'Coordinación General', marcaId: marca.id } });
    }

    const dummyHash = await hashPassword('invitado_seguro_outlet_2026');
    guestUser = await prisma.usuario.create({
      data: {
        nombre: 'Invitado',
        email: 'invitado@autocorp.mx',
        passwordHash: dummyHash,
        tipoUsuarioId: tipoInvitado.id,
        unidadNegocioId: unidad.id,
        activo: true,
      },
      include: { tipoUsuario: true },
    });
  }

  const { accessTokenTtlSeconds, refreshTokenTtlSeconds } = getAuthConfig();
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(guestUser),
    signRefreshToken(guestUser),
  ]);

  return { guestUser, accessToken, refreshToken, accessTokenTtlSeconds, refreshTokenTtlSeconds };
}

export async function POST() {
  try {
    const { guestUser, accessToken, refreshToken, accessTokenTtlSeconds, refreshTokenTtlSeconds } = await getOrCreateGuestSession();
    const cookieStore = await cookies();
    setAccessCookie(cookieStore, accessToken, accessTokenTtlSeconds);
    setRefreshCookie(cookieStore, refreshToken, refreshTokenTtlSeconds);

    return Response.json({
      id: guestUser.id,
      nombre: 'Invitado',
      email: guestUser.email,
      tipoUsuarioId: guestUser.tipoUsuarioId,
      tipoUsuarioNombre: 'Invitado',
      esInvitado: true,
      esAdministrador: false,
      permisos: ['vehiculo.leer', 'guardia.leer', 'actividad.leer', 'cliente.leer', 'demo.leer'],
    });
  } catch (error) {
    console.error('Error en autenticación de invitado:', error);
    return Response.json(
      { error: 'No se pudo iniciar sesión como invitado' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') || '/';

    const { accessToken, refreshToken, accessTokenTtlSeconds, refreshTokenTtlSeconds } = await getOrCreateGuestSession();

    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: accessTokenTtlSeconds,
    });
    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: refreshTokenTtlSeconds,
    });

    return response;
  } catch (error) {
    console.error('Error en guest GET redirect:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
