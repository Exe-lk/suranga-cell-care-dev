import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const modelApiSlice = createApi({
  reducerPath: 'modelApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://surangacellcare-dev.netlify.app/api/'   }),
  tagTypes: ['Model', 'Category', 'Brand'],
  endpoints: (builder) => ({
    getModels: builder.query({
      query: () => 'model/route',
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
