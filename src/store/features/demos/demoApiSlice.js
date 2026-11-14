import { apiSlice } from '../../services/apiSlice';
import { toPaginationQueryString } from '@/lib/pagination';

export const demoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDemos: builder.query({
      query: (pagination) => `/demos${toPaginationQueryString(pagination)}`,
      providesTags: ['Demo'],
    }),
    createDemo: builder.mutation({
      query: (data) => ({ url: '/demos', method: 'POST', body: data }),
      invalidatesTags: ['Demo'],
    }),
    deleteDemo: builder.mutation({
      query: (id) => ({ url: `/demos/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Demo'],
    }),
  }),
});

export const { useGetDemosQuery, useCreateDemoMutation, useDeleteDemoMutation } = demoApiSlice;
