import { apiSlice } from '../../services/apiSlice';
import { toQueryString } from '@/lib/pagination';

export const vehiculoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // params: { page, pageSize, estatus, marcaId, servicioId, q }
    getVehiculos: builder.query({
      query: (params) => `/vehiculos${toQueryString(params)}`,
      providesTags: ['Vehiculo'],
    }),
    createVehiculo: builder.mutation({
      query: (data) => ({ url: '/vehiculos', method: 'POST', body: data }),
      invalidatesTags: ['Vehiculo'],
    }),
    updateVehiculo: builder.mutation({
      query: ({ id, data }) => ({ url: `/vehiculos/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Vehiculo'],
    }),
  }),
});

export const { useGetVehiculosQuery, useCreateVehiculoMutation, useUpdateVehiculoMutation } = vehiculoApiSlice;
