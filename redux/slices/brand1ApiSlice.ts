import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const brand1ApiSlice = createApi({
  reducerPath: 'brand1Api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['Brand1'],
  endpoints: (builder) => ({
    getBrands1: builder.query({
      query: () => 'brand1/route',
      providesTags: ['Brand1'],
    }),
    getBrand1ById: builder.query({
      query: (id) => `brand1/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand1', id }],
    }),
    getDeleteBrands1: builder.query({
      query: () => 'brand1/bin',
      providesTags: ['Brand1'],
    }),
    addBrand1: builder.mutation({
      query: (newBrand1) => ({
        url: 'brand1/route',
        method: 'POST',
        body: newBrand1,
      }),
      invalidatesTags: ['Brand1'],
    }),
    updateBrand1: builder.mutation({
      query: ({ id, ...updatedBrand1 }) => ({
        url: `brand1/${id}`,
        method: 'PUT',
        body: updatedBrand1,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand1', id }],
    }),
    deleteBrand1: builder.mutation({
      query: (id) => ({
        url: `brand1/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Brand1', id }],
    }),
  }),
});

export const {
  useGetBrands1Query,
  useGetBrand1ByIdQuery,
  useGetDeleteBrands1Query,
  useAddBrand1Mutation,
  useUpdateBrand1Mutation,
  useDeleteBrand1Mutation,
} = brand1ApiSlice;
