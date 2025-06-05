import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlices';
import blogReducer from './slices/blogSlice';
import userReducer from './slices/userSlice';
import ordersReducer from './slices/ordersSlice';
import reviewsReducer from './slices/reviewsSlice';
import couponsReducer from './slices/couponsSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    blogs: blogReducer,
    user: userReducer,
    orders: ordersReducer,
    reviews: reviewsReducer,
    coupons: couponsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/FLUSH',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;