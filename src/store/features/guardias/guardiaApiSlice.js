import { apiSlice } from '../../services/apiSlice';
import { toPaginationQueryString } from '@/lib/pagination';

export const guardiaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGuardias: builder.query({
      query: (pagination) => `/guardias${toPaginationQueryString(pagination)}`,
      providesTags: ['Guardia'],
    }),
    createGuardia: builder.mutation({
      query: (data) => ({ url: '/guardias', method: 'POST', body: data }),
      invalidatesTags: ['Guardia'],
    }),
    updateGuardia: builder.mutation({
      query: ({ id, data }) => ({ url: `/guardias/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Guardia'],
    }),
    deleteGuardia: builder.mutation({
      query: (id) => ({ url: `/guardias/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Guardia'],
    }),
  }),
});

export const {
  useGetGuardiasQuery,
  useCreateGuardiaMutation,
  useUpdateGuardiaMutation,
  useDeleteGuardiaMutation,
} = guardiaApiSlice;
