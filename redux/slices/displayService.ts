import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const billdisplayApiSlice = createApi({
	reducerPath: 'billdisplayApi',
	baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL }),
	tagTypes: ['billdisplayApi'],
	endpoints: (builder) => ({
		getBills: builder.query({
			query: () => 'billDisplay/route',
			providesTags: ['billdisplayApi'],
		}),
		addBill: builder.mutation({
			query: (newBill) => ({
				url: 'billDisplay/route',
				method: 'POST',
				body: newBill,
			}),
			invalidatesTags: ['billdisplayApi'],
		}),
	}),
});

export const {
	useGetBillsQuery,
	useAddBillMutation
} = billdisplayApiSlice;
