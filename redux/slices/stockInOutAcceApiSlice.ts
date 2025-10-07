import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const stockInOutAcceApiSlice = createApi({
  reducerPath: 'stockInOutAcceApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['StockInOutAcce', 'ItemAcce'],
  endpoints: (builder) => ({
    getStockInOuts: builder.query({
      query: () => 'stockInOutAcce/route',
      providesTags: ['StockInOutAcce'],
    }),
    getStockInOutById: builder.query({
      query: (id) => `stockInOutAcce/${id}`,
      providesTags: ['StockInOutAcce'],
    }),
    getStockInOutByBarcode: builder.query({
      query: (barcode) => `stockInOutAcce/barcode/${barcode}`,
      providesTags: ['StockInOutAcce'],
    }),
    getAllStockRecords: builder.query({
      query: () => `stockInOutAcce/route1`, 
      providesTags: ['StockInOutAcce'],
    }),
    getStockInOutByDate: builder.query({
      query: (date) => `stockInOutAcce/route1?date=${date}`, // Accepts date from frontend
      providesTags: ['StockInOutAcce'],
    }),
    getDeleteStockInOuts: builder.query({
      query: () => 'stockInOutAcce/bin',
      providesTags: ['StockInOutAcce'],
    }),
    addStockIn: builder.mutation({
      query: (newStockIn) => ({
        url: 'stockInOutAcce/route',
        method: 'POST',
        body: newStockIn,
      }),
      invalidatesTags: ['StockInOutAcce', 'ItemAcce'],
    }),
    addStockOut: builder.mutation({
      query: (newStockOut) => ({
        url: 'stockInOutAcce/route1',
        method: 'POST',
        body: newStockOut,
      }),
      invalidatesTags: ['StockInOutAcce', 'ItemAcce'],
    }),
    updateStockInOut: builder.mutation({
      query: (updatedStockInOut) => ({
        url: `stockInOutAcce/${updatedStockInOut.id}`,
        method: 'PUT',
        body: updatedStockInOut,
      }),
      invalidatesTags: ['StockInOutAcce', 'ItemAcce'],
    }),
    deleteStockInOut: builder.mutation({
      query: (id) => ({
        url: `stockInOutAcce/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetStockInOutsQuery,
  useGetStockInOutByIdQuery,
  useGetStockInOutByBarcodeQuery,
  useGetAllStockRecordsQuery,
  useGetStockInOutByDateQuery,  // Now accepts date from frontend
  useGetDeleteStockInOutsQuery,
  useAddStockInMutation,
  useAddStockOutMutation,
  useUpdateStockInOutMutation,
  useDeleteStockInOutMutation,
} = stockInOutAcceApiSlice;
