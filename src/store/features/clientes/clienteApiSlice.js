import { apiSlice } from '../../services/apiSlice';
import { toQueryString } from '@/lib/pagination';

export const clienteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // params: { page, pageSize, q }
    getClientes: builder.query({
      query: (params) => `/clientes${toQueryString(params)}`,
      providesTags: ['Cliente'],
    }),
    createCliente: builder.mutation({
      query: (data) => ({ url: '/clientes', method: 'POST', body: data }),
      invalidatesTags: ['Cliente'],
    }),
    updateCliente: builder.mutation({
      query: ({ id, data }) => ({ url: `/clientes/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Cliente'],
    }),
  }),
});

export const { useGetClientesQuery, useCreateClienteMutation, useUpdateClienteMutation } = clienteApiSlice;
