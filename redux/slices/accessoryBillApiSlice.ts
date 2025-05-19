import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const accessoryBillApiSlice = createApi({
  reducerPath: 'accessoryBillApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['AccessoryBill'],
  endpoints: (builder) => ({
    getAccessoryBills: builder.query({
      query: () => 'accessory-bill/route',
      providesTags: ['AccessoryBill'],
    }),
    getAccessoryBillById: builder.query({
      query: (id) => `accessory-bill/${id}`,
      providesTags: ['AccessoryBill'],
    }),
    addAccessoryBill: builder.mutation({
      query: (newBill) => ({
        url: 'accessory-bill/route',
        method: 'POST',
        body: newBill,
      }),
      invalidatesTags: ['AccessoryBill'],
    }),
    updateAccessoryBill: builder.mutation({
      query: (updatedBill) => ({
        url: `accessory-bill/${updatedBill.id}`,
        method: 'PUT',
        body: updatedBill,
      }),
      invalidatesTags: ['AccessoryBill'],
    }),
    deleteAccessoryBill: builder.mutation({
      query: (id) => ({
        url: `accessory-bill/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AccessoryBill'],
    }),
  }),
});

export const {
  useGetAccessoryBillsQuery,
  useGetAccessoryBillByIdQuery,
  useAddAccessoryBillMutation,
  useUpdateAccessoryBillMutation,
  useDeleteAccessoryBillMutation,
} = accessoryBillApiSlice; 