import { apiSlice } from '../../services/apiSlice';
import { toPaginationQueryString } from '@/lib/pagination';

export const actividadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActividades: builder.query({
      query: (pagination) => `/actividades${toPaginationQueryString(pagination)}`,
      providesTags: ['Actividad'],
    }),
    createActividad: builder.mutation({
      query: (data) => ({ url: '/actividades', method: 'POST', body: data }),
      invalidatesTags: ['Actividad'],
    }),
    updateActividad: builder.mutation({
      query: ({ id, data }) => ({ url: `/actividades/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Actividad'],
    }),
    deleteActividad: builder.mutation({
      query: (id) => ({ url: `/actividades/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Actividad'],
    }),
  }),
});

export const {
  useGetActividadesQuery,
  useCreateActividadMutation,
  useUpdateActividadMutation,
  useDeleteActividadMutation,
} = actividadApiSlice;
