import { configureStore } from '@reduxjs/toolkit';
import { duckApi } from '../services/duckApi';
import searchReducer from '../features/searchSlice';

export const store = configureStore({
  reducer: {
    [duckApi.reducerPath]: duckApi.reducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(duckApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
