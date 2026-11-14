const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hora

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function refreshTokenTtlSeconds() {
  const eventEndDate = requireEnv('EVENT_END_DATE');
  const endMs = new Date(eventEndDate).getTime();
  if (Number.isNaN(endMs)) {
    throw new Error(`EVENT_END_DATE inválida: ${eventEndDate}`);
  }

  const remainingSeconds = Math.floor((endMs - Date.now()) / 1000);
  // Si el evento ya terminó, el refresh token dura 1 minuto: suficiente para
  // que un login explícito funcione, sin dejar sesiones vivas indefinidamente.
  return remainingSeconds > 0 ? remainingSeconds : 60;
}

export function getAuthConfig() {
  return {
    accessTokenSecret: new TextEncoder().encode(requireEnv('JWT_ACCESS_SECRET')),
    refreshTokenSecret: new TextEncoder().encode(requireEnv('JWT_REFRESH_SECRET')),
    accessTokenTtlSeconds: ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: refreshTokenTtlSeconds(),
  };
}
