import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const model1ApiSlice = createApi({
  reducerPath: 'model1Api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://suranga-cell-care.netlify.app/api/'  }),
  tagTypes: ['Model1'],
  endpoints: (builder) => ({
    getModels1: builder.query({
      query: () => 'model1/route',
      providesTags: ['Model1'],
    }),
    getModel1ById: builder.query({
      query: (id) => `model1/${id}`,
      providesTags: (result, error, id) => [{ type: 'Model1', id }],
    }),
    getDeleteModels1: builder.query({
      query: () => 'model1/bin',
      providesTags: ['Model1'],
    }),
    addModel1: builder.mutation({
      query: (newModel1) => ({
        url: 'model1/route',
        method: 'POST',
        body: newModel1,
      }),
      invalidatesTags: ['Model1'],
    }),
    updateModel1: builder.mutation({
      query: ({ id, ...updatedModel1 }) => ({
        url: `model1/${id}`,
        method: 'PUT',
        body: updatedModel1,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Model1', id }],
    }),
    deleteModel1: builder.mutation({
      query: (id) => ({
        url: `model1/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Model1', id }],
    }),
  }),
});

export const {
  useGetModels1Query,
  useGetModel1ByIdQuery,
  useGetDeleteModels1Query,
  useAddModel1Mutation,
  useUpdateModel1Mutation,
  useDeleteModel1Mutation,
} = model1ApiSlice;
