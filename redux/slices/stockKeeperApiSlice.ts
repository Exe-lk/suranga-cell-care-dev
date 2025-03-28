import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const stockKeeperApiSlice = createApi({
  reducerPath: 'stockKeeperApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://suranga-cell-care.netlify.app/api/'  }),
  tagTypes: ['StockKeeper'],
  endpoints: (builder) => ({
    getStockKeepers: builder.query({
      query: () => 'stockKeeper/route',
      providesTags: ['StockKeeper'],
    }),
    getStockKeeperById: builder.query({
      query: (id) => `stockKeeper/${id}`,
      providesTags: (result, error, id) => [{ type: 'StockKeeper', id }],
    }),
    getDeleteStockKeepers: builder.query({
      query: () => 'stockKeeper/bin',
      providesTags: ['StockKeeper'],
    }),
    addStockKeeper: builder.mutation({
      query: (newStockKeeper) => ({
        url: 'stockKeeper/route',
        method: 'POST',
        body: newStockKeeper,
      }),
      invalidatesTags: ['StockKeeper'],
    }),
    updateStockKeeper: builder.mutation({
      query: ({ id, ...updatedStockKeeper }) => ({
        url: `stockKeeper/${id}`,
        method: 'PUT',
        body: updatedStockKeeper,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'StockKeeper', id }],
    }),
    deleteStockKeeper: builder.mutation({
      query: (id) => ({
        url: `stockKeeper/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'StockKeeper', id }],
    }),
  }),
});

export const {
  useGetStockKeepersQuery,
  useGetStockKeeperByIdQuery,
  useGetDeleteStockKeepersQuery,
  useAddStockKeeperMutation,
  useUpdateStockKeeperMutation,
  useDeleteStockKeeperMutation,
} = stockKeeperApiSlice;
