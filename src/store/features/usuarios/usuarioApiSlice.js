import { apiSlice } from '../../services/apiSlice';
import { toPaginationQueryString } from '@/lib/pagination';

export const usuarioApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsuarios: builder.query({
      query: (pagination) => `/usuarios${toPaginationQueryString(pagination)}`,
      providesTags: ['Usuario'],
    }),
    createUsuario: builder.mutation({
      query: (data) => ({ url: '/usuarios', method: 'POST', body: data }),
      invalidatesTags: ['Usuario'],
    }),
    updateUsuario: builder.mutation({
      query: ({ id, data }) => ({ url: `/usuarios/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Usuario'],
    }),
  }),
});

export const { useGetUsuariosQuery, useCreateUsuarioMutation, useUpdateUsuarioMutation } = usuarioApiSlice;
