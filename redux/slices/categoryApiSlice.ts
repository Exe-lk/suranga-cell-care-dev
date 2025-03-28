// redux/slices/usersSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
  id: string;
  name: string;
  gender: string;
  address: string;
}

export interface Category {
  id: string;
  name: string;
  status: boolean;
  timestamp: any;
}

export const categoryApiSlice = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/category' }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/route',
      providesTags: ['Category'],
    }),
    getDeleteCategories: builder.query<Category[], void>({
      query: () => '/bin',
      providesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: string; name: string; status: boolean }>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetDeleteCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
