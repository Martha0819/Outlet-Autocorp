import { SignJWT, jwtVerify } from 'jose';
import { getAuthConfig } from './config.js';

export async function signAccessToken(usuario) {
  const { accessTokenSecret, accessTokenTtlSeconds } = getAuthConfig();

  return new SignJWT({
    sub: String(usuario.id),
    tokenVersion: usuario.tokenVersion,
    tipoUsuarioId: usuario.tipoUsuarioId,
    unidadNegocioId: usuario.unidadNegocioId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${accessTokenTtlSeconds}s`)
    .sign(accessTokenSecret);
}

export async function signRefreshToken(usuario) {
  const { refreshTokenSecret, refreshTokenTtlSeconds } = getAuthConfig();

  return new SignJWT({
    sub: String(usuario.id),
    tokenVersion: usuario.tokenVersion,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${refreshTokenTtlSeconds}s`)
    .sign(refreshTokenSecret);
}

export async function verifyAccessToken(token) {
  const { accessTokenSecret } = getAuthConfig();
  const { payload } = await jwtVerify(token, accessTokenSecret);
  return payload;
}

export async function verifyRefreshToken(token) {
  const { refreshTokenSecret } = getAuthConfig();
  const { payload } = await jwtVerify(token, refreshTokenSecret);
  return payload;
}
