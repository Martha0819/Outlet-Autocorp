import { apiSlice } from '../../services/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    loginGuest: builder.mutation({
      query: () => ({
        url: '/auth/guest',
        method: 'POST',
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    // Rehidrata auth.usuario tras un refresh de página: la cookie httpOnly
    // sigue viva (por eso el middleware deja pasar), pero el estado de Redux
    // es solo memoria del navegador y se pierde en cada reload.
    verify: builder.query({
      query: () => '/auth/verify',
    }),
  }),
});

export const { useLoginMutation, useLoginGuestMutation, useLogoutMutation, useVerifyQuery } = authApiSlice;
