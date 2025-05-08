import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoryApiSlice = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (searchTerm) => searchTerm ? `category/route?search=${searchTerm}` : 'category/route',
      providesTags: ['Category'],
    }),
    getCategoryById: builder.query({
      query: (id) => `category/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    getDeleteCategories: builder.query({
      query: () => 'category/bin',
      providesTags: ['Category'],
    }),
    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: 'category/route',
        method: 'POST',
        body: newCategory,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...updatedCategory }) => ({
        url: `category/${id}`,
        method: 'PUT',
        body: updatedCategory,
      }),
      invalidatesTags: (result, error,  id ) => [
        { type: 'Category', id },
        // 'Category',
        // 'Brand',
        // 'Model'
      ],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetDeleteCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
