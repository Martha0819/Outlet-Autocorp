import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { setAuth, logout } from '../features/auth/authSlice';

// Un solo refresh en vuelo a la vez: si varias queries disparan 401 al mismo
// tiempo, solo la primera llama a /auth/refresh; el resto espera el mutex y
// reintenta con el access token ya renovado.
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  // Las rutas /api/auth/* son del mismo Next.js app (ver src/app/api/auth/),
  // así que no hace falta NEXT_PUBLIC_HOST; "credentials: include" es lo que
  // hace que el navegador mande las cookies httpOnly de access/refresh.
  credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          api.dispatch(setAuth());
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Usuario',
    'Vehiculo',
    'Cliente',
    'Negocio',
    'Demo',
    'Guardia',
    'Actividad',
    'UnidadNegocio',
    'Catalogo',
    'Permiso',
    'Marca',
  ],
  endpoints: () => ({}),
});
