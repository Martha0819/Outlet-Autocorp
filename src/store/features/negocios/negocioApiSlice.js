import { apiSlice } from '../../services/apiSlice';

export const negocioApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNegocios: builder.query({
      query: (clienteId) => (clienteId ? `/negocios?clienteId=${clienteId}` : '/negocios'),
      providesTags: ['Negocio'],
    }),
    createNegocio: builder.mutation({
      query: (data) => ({ url: '/negocios', method: 'POST', body: data }),
      invalidatesTags: ['Negocio'],
    }),
    updateNegocio: builder.mutation({
      query: ({ id, data }) => ({ url: `/negocios/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Negocio'],
    }),
  }),
});

export const { useGetNegociosQuery, useCreateNegocioMutation, useUpdateNegocioMutation } = negocioApiSlice;
