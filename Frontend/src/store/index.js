// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventSlice';
import swapsReducer from './slices/swapSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    swaps: swapsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;