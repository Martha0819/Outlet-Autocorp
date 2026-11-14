import { apiSlice } from '../../services/apiSlice';

export const permisoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermisosMatriz: builder.query({
      query: () => '/permisos',
      providesTags: ['Permiso'],
    }),
    togglePermiso: builder.mutation({
      query: ({ tipoUsuarioId, permisoId }) => ({
        url: '/permisos/toggle',
        method: 'POST',
        body: { tipoUsuarioId, permisoId },
      }),
      invalidatesTags: ['Permiso'],
    }),
  }),
});

export const { useGetPermisosMatrizQuery, useTogglePermisoMutation } = permisoApiSlice;
