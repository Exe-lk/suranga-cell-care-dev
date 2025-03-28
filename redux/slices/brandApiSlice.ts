import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const brandApiSlice = createApi({
  reducerPath: 'brandApi',

  baseQuery: fetchBaseQuery({ baseUrl: 'https://suranga-cell-care.netlify.app/api/'  }),

  tagTypes: ['Brand'],
  endpoints: (builder) => ({
    getBrands: builder.query({
      query: () => 'brand/route',
      providesTags: ['Brand'],
    }),
    getBrandById: builder.query({
      query: (id) => `brand/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand', id }],
    }),
    getDeleteBrands: builder.query({
      query: () => 'brand/bin',
      providesTags: ['Brand'],
    }),
    addBrand: builder.mutation({
      query: (newBrand) => ({
        url: 'brand/route',
        method: 'POST',
        body: newBrand,
      }),
      invalidatesTags: ['Brand'],
    }),
    updateBrand: builder.mutation({
      query: ({ id, ...updatedBrand }) => ({
        url: `brand/${id}`,
        method: 'PUT',
        body: updatedBrand,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand', id }],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({
        url: `brand/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Brand', id }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useGetDeleteBrandsQuery,
  useAddBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApiSlice;
