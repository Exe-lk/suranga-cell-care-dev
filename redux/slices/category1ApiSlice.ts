import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const category1ApiSlice = createApi({
  reducerPath: 'category1Api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['Category1'],
  endpoints: (builder) => ({
    getCategories1: builder.query({
      query: (searchTerm) => searchTerm ? `category1/route?search=${searchTerm}` : 'category1/route',
      providesTags: ['Category1'],
    }),
    getCategory1ById: builder.query({
      query: (id) => `category1/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category1', id }],
    }),
    getDeleteCategories1: builder.query({
      query: () => 'category1/bin',
      providesTags: ['Category1'],
    }),
    addCategory1: builder.mutation({
      query: (newCategory1) => ({
        url: 'category1/route',
        method: 'POST',
        body: newCategory1,
      }),
      invalidatesTags: ['Category1'],
    }),
    updateCategory1: builder.mutation({
      query: ({ id, ...updatedCategory1 }) => ({
        url: `category1/${id}`,
        method: 'PUT',
        body: updatedCategory1,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category1', id }],
    }),
    deleteCategory1: builder.mutation({
      query: (id) => ({
        url: `category1/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Category1', id }],
    }),
  }),
});

export const {
  useGetCategories1Query,
  useGetCategory1ByIdQuery,
  useGetDeleteCategories1Query,
  useAddCategory1Mutation,
  useUpdateCategory1Mutation,
  useDeleteCategory1Mutation,
} = category1ApiSlice;
