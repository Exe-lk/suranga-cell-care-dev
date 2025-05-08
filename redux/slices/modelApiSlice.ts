import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const modelApiSlice = createApi({
  reducerPath: 'modelApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['Model', 'Category', 'Brand'],
  endpoints: (builder) => ({
    getModels: builder.query({
      query: (searchTerm) => searchTerm ? `model/route?search=${searchTerm}` : 'model/route',
      providesTags: ['Model'],
    }),
    getModelById: builder.query({
      query: (id) => `model/${id}`,
      providesTags: (result, error, id) => [{ type: 'Model', id }],
    }),
    getDeleteModels: builder.query({
      query: () => 'model/bin',
      providesTags: ['Model'],
    }),
    addModel: builder.mutation({
      query: (newModel) => ({
        url: 'model/route',
        method: 'POST',
        body: newModel,
      }),
      invalidatesTags: ['Model'],
    }),
    updateModel: builder.mutation({
      query: ({ id, ...updatedModel }) => ({
        url: `model/${id}`,
        method: 'PUT',
        body: updatedModel,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Model', id }, 'Model'],
    }),
    deleteModel: builder.mutation({
      query: (id) => ({
        url: `model/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Model', id }, 'Model'],
    }),
  }),
});

export const {
  useGetModelsQuery,
  useGetModelByIdQuery,
  useGetDeleteModelsQuery,
  useAddModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
} = modelApiSlice;
