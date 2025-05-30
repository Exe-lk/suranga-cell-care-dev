import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userManagementApiSlice = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => 'user_management/route',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `user_management/${id}`,
      providesTags: ['User'],
    }),
    getDeleteUsers: builder.query({
      query: () => 'user_management/bin',
      providesTags: ['User'],
    }),
    addUser: builder.mutation({
      query: (newUser) => ({
        url: 'user_management/route',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...updatedUser }) => ({
        url: `user_management/${id}`,
        method: 'PUT',
        body: updatedUser,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `user_management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetDeleteUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userManagementApiSlice;
