import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const repairedPhoneApiSlice = createApi({
  reducerPath: 'repairedPhoneApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['repairedPhone'],
  endpoints: (builder) => ({
    getrepairedPhones: builder.query({
      query: () => 'repairedPhone/route',
      providesTags: ['repairedPhone'],
    }),
    getrepairedPhoneById: builder.query({
      query: (id) => `repairedPhone/${id}`,
      providesTags: ['repairedPhone'],
    }),
    updaterepairedPhone: builder.mutation({
      query: (updatedrepairedPhone) => ({
        url: `repairedPhone/${updatedrepairedPhone.id}`,
        method: 'PUT',
        body: updatedrepairedPhone,
      }),
      invalidatesTags: ['repairedPhone'],
    }),
  }),
});


export const {
  useGetrepairedPhonesQuery,
  useGetrepairedPhoneByIdQuery,
  useUpdaterepairedPhoneMutation,
} = repairedPhoneApiSlice;
