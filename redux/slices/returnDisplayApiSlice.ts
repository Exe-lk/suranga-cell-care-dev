import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../lib/supabase';

interface ReturnDisplayItem {
  id: number;
  barcode: string;
  brand: string;
  category: string;
  model: string;
  condition: string;
  date: string;
}

// Fetch all returns from Supabase
async function fetchAllReturns() {
  try {
    const { data, error } = await supabase
      .from('returnDisplay')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching return display data:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Exception in fetchAllReturns:', error);
    return [];
  }
}

// Create API slice
export const returnDisplayApiSlice = createApi({
  reducerPath: 'returnDisplayApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['ReturnDisplay'],
  endpoints: (builder) => ({
    // Get all return display items
    getAllReturns: builder.query<ReturnDisplayItem[], void>({
      queryFn: async () => {
        try {
          const data = await fetchAllReturns();
          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: ['ReturnDisplay'],
    }),

    // Get return display item by ID
    getReturnById: builder.query<ReturnDisplayItem, number>({
      queryFn: async (id) => {
        try {
          const { data, error } = await supabase
            .from('returnDisplay')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'ReturnDisplay', id }],
    }),

    // Add new return display item
    addReturn: builder.mutation<void, Partial<ReturnDisplayItem>>({
      queryFn: async (returnData) => {
        try {
          const { error } = await supabase
            .from('returnDisplay')
            .insert([returnData]);

          if (error) throw error;
          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['ReturnDisplay'],
    }),

    // Delete return display item
    deleteReturn: builder.mutation<void, number>({
      queryFn: async (id) => {
        try {
          const { error } = await supabase
            .from('returnDisplay')
            .delete()
            .eq('id', id);

          if (error) throw error;
          return { data: undefined };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
      invalidatesTags: ['ReturnDisplay'],
    }),
  }),
});

export const {
  useGetAllReturnsQuery,
  useGetReturnByIdQuery,
  useAddReturnMutation,
  useDeleteReturnMutation,
} = returnDisplayApiSlice; 