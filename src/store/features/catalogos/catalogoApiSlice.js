import { apiSlice } from '../../services/apiSlice';

// CRUD genérico para los 9 catálogos del sistema (marca, linea-negocio,
// unidad-negocio, dependencia, tipo-usuario, permiso, turno, etapa,
// tipo-seguimiento) contra /api/catalogos/[tipo] — ver
// src/lib/catalogos/config.js para la whitelist de campos por catálogo.
export const catalogoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Nunca paginado a propósito — ver el comentario en
    // src/app/api/catalogos/[tipo]/route.js.
    getCatalogo: builder.query({
      query: (tipo) => `/catalogos/${tipo}`,
      providesTags: (result, error, tipo) => [{ type: 'Catalogo', id: tipo }],
    }),
    getCatalogoItem: builder.query({
      query: ({ tipo, id }) => `/catalogos/${tipo}/${id}`,
      providesTags: (result, error, { tipo, id }) => [{ type: 'Catalogo', id: `${tipo}-${id}` }],
    }),
    createCatalogoItem: builder.mutation({
      query: ({ tipo, data }) => ({
        url: `/catalogos/${tipo}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { tipo }) => [{ type: 'Catalogo', id: tipo }],
    }),
    updateCatalogoItem: builder.mutation({
      query: ({ tipo, id, data }) => ({
        url: `/catalogos/${tipo}/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { tipo, id }) => [
        { type: 'Catalogo', id: tipo },
        { type: 'Catalogo', id: `${tipo}-${id}` },
      ],
    }),
    deleteCatalogoItem: builder.mutation({
      query: ({ tipo, id }) => ({
        url: `/catalogos/${tipo}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { tipo }) => [{ type: 'Catalogo', id: tipo }],
    }),
  }),
});

export const {
  useGetCatalogoQuery,
  useGetCatalogoItemQuery,
  useCreateCatalogoItemMutation,
  useUpdateCatalogoItemMutation,
  useDeleteCatalogoItemMutation,
} = catalogoApiSlice;
