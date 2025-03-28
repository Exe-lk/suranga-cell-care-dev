import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const supplierApiSlice = createApi({
  reducerPath: 'supplierApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://suranga-cell-care.netlify.app/api/'  }),
  tagTypes: ['Supplier'],
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: () => 'supplier/route',
      providesTags: ['Supplier'],
    }),
    getSupplierById: builder.query({
      query: (id) => `supplier/${id}`,
      providesTags: ['Supplier'],
    }),
    getDeleteSuppliers: builder.query({
      query: () => 'supplier/bin',
      providesTags: ['Supplier'],
    }),
    addSupplier: builder.mutation({
      query: (newSupplier) => ({
        url: 'supplier/route',
        method: 'POST',
        body: newSupplier,
      }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation({
      query: (updatedSupplier) => ({
        url: `supplier/${updatedSupplier.id}`,
        method: 'PUT',
        body: updatedSupplier,
      }),
      invalidatesTags: ['Supplier'],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `supplier/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useGetDeleteSuppliersQuery,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApiSlice;
