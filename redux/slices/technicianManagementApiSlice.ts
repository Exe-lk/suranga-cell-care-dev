import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const technicianApiSlice = createApi({
  reducerPath: 'technicianApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['Technician'],
  endpoints: (builder) => ({
    getTechnicians: builder.query({
      query: (searchTerm) => searchTerm ? `technicianManagement/route?search=${searchTerm}` : 'technicianManagement/route',
      providesTags: ['Technician'],
    }),
    getTechnicianById: builder.query({
      query: (id) => `technicianManagement/${id}`,
      providesTags: ['Technician'],
    }),
    getDeleteTechnicians: builder.query({
      query: () => 'technicianManagement/bin',
      providesTags: ['Technician'],
    }),
    addTechnician: builder.mutation({
      query: (newTechnician) => ({
        url: 'technicianManagement/route',
        method: 'POST',
        body: newTechnician,
      }),
      invalidatesTags: ['Technician'],
    }),
    updateTechnician: builder.mutation({
      query: (updatedTechnician) => ({
        url: `technicianManagement/${updatedTechnician.id}`,
        method: 'PUT',
        body: updatedTechnician,
      }),
      invalidatesTags: ['Technician'],
    }),
    deleteTechnician: builder.mutation({
      query: (id) => ({
        url: `technicianManagement/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetTechniciansQuery,
  useGetTechnicianByIdQuery,
  useGetDeleteTechniciansQuery,
  useAddTechnicianMutation,
  useUpdateTechnicianMutation,
  useDeleteTechnicianMutation,
} = technicianApiSlice;
