import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const ItemAcceApiSlice = createApi({
  reducerPath: 'ItemAcceApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://suranga-cell-care.netlify.app/api/'  }),
  tagTypes: ['ItemAcce'],
  endpoints: (builder) => ({
    getItemAcces: builder.query({
      query: () => 'itemManagementAcce/route',
      providesTags: ['ItemAcce'],
    }),
    getItemAcces1: builder.query({
      query: ({ page, perPage, lastDoc,searchtearm }) => ({
        url: `itemManagementAcce/route1?page=${page}&perPage=${perPage}&lastDoc=${lastDoc || ''}&searchTerm=${searchtearm||''}`,
      }),
      providesTags: ['ItemAcce'],
    }),
    getItemAcceById: builder.query({
      query: (id) => `itemManagementAcce/${id}`,
      providesTags: ['ItemAcce'],
    }),
    getDeleteItemAcces: builder.query({
      query: () => 'itemManagementAcce/bin',
      providesTags: ['ItemAcce'],
    }),
    addItemAcce: builder.mutation({
      query: (newItemAcce) => ({
        url: 'itemManagementAcce/route',
        method: 'POST',
        body: newItemAcce,
      }),
      invalidatesTags: ['ItemAcce'],
    }),
    updateItemAcce: builder.mutation({
      query: (updatedItemAcce) => ({
        url: `itemManagementAcce/${updatedItemAcce.id}`,
        method: 'PUT',
        body: updatedItemAcce,
      }),
      invalidatesTags: ['ItemAcce'],
    }),
    deleteItemAcce: builder.mutation({
      query: (id) => ({
        url: `itemManagementAcce/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetItemAccesQuery,
  useGetItemAcces1Query,
  useGetItemAcceByIdQuery,
  useGetDeleteItemAccesQuery,
  useAddItemAcceMutation,
  useUpdateItemAcceMutation,
  useDeleteItemAcceMutation,
} = ItemAcceApiSlice;
