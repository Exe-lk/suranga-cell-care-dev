import { configureStore, combineReducers } from "@reduxjs/toolkit";
import usersReducer, { setUsers } from "./slices/usersSlice";
import categoriesReducer, { setCategories } from "./slices/categoriesSlice";

import { subscribeToCategories } from "../service/categoryService";
import { persistStore, persistReducer } from "redux-persist";
import Cookies from 'js-cookie';
import { categoryApiSlice } from './slices/categoryApiSlice';

// Create a custom storage engine using cookies
const createCookieStorage = () => {
  return {
    getItem(key: string) {
      const value = Cookies.get(key);
      return Promise.resolve(value ? JSON.parse(value) : null);
    },
    setItem(key: string, value: any) {
      Cookies.set(key, JSON.stringify(value), { 
        expires: 7, // Cookie expires in 7 days
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict'
      });
      return Promise.resolve(value);
    },
    removeItem(key: string) {
      Cookies.remove(key);
      return Promise.resolve();
    },
  };
};

// Create a no-op storage (used on the server)
const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

// Use cookie storage when in a browser; otherwise, use the no-op storage
const storage =
  typeof window !== "undefined"
    ? createCookieStorage()
    : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["users", "categories"], // persist both users and categories slices
};

const rootReducer = combineReducers({
  users: usersReducer,
  categories: categoriesReducer,
  [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions which include non-serializable values
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
          "categories/setCategories", // Ignore the categories action
        ],
      },
    }).concat(categoryApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Guard to subscribe only once per browser session (avoiding duplicate subscriptions)
if (typeof window !== "undefined") {
  // Subscribe to users
  

  // Subscribe to categories
  if (!(window as any).__CATEGORIES_SUBSCRIBED__) {
    subscribeToCategories((categories) => {
      store.dispatch(setCategories(categories));
    });
    (window as any).__CATEGORIES_SUBSCRIBED__ = true;
  }
}

export const persistor = persistStore(store);