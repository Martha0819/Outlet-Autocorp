export const ACCESS_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

export function setAccessCookie(cookieStore, token, ttlSeconds) {
  cookieStore.set(ACCESS_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: ttlSeconds,
  });
}

export function setRefreshCookie(cookieStore, token, ttlSeconds) {
  cookieStore.set(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: ttlSeconds,
  });
}

export function clearAuthCookies(cookieStore) {
  cookieStore.set(ACCESS_COOKIE_NAME, '', { ...baseCookieOptions(), maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE_NAME, '', { ...baseCookieOptions(), maxAge: 0 });
}
