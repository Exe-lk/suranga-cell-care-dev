import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Category {
  id: string;
  name: string;
  status: boolean;
  timestamp: any;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(category => category.id !== action.payload);
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setCategories, setLoading, setError, deleteCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer; 