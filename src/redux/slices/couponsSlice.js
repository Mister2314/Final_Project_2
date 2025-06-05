import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

const initialState = {
  coupons: [],
  loading: false,
  error: null,
  currentCoupon: null
};

export const validateCoupon = createAsyncThunk(
  'coupons/validateCoupon',
  async (code, { rejectWithValue }) => {
    try {
      console.log('Validating coupon code:', code);
      
      if (!code || typeof code !== 'string') {
        console.error('Invalid coupon code format:', code);
        throw new Error('Invalid coupon code format');
      }

      // Trim the code and convert to uppercase for consistent comparison
      const trimmedCode = code.trim().toUpperCase();
      console.log('Trimmed coupon code:', trimmedCode);
      
      // Use ilike for case-insensitive comparison with the exact code
      const { data, error } = await supabase
        .from('coupons')
        .select('id, code, percentage')
        .ilike('code', trimmedCode)
        .single(); // Use single() since we expect only one coupon

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === 'PGRST116') {
          // No rows returned
          throw new Error('Invalid coupon code');
        }
        throw new Error(error.message || 'Invalid coupon code');
      }

      if (!data) {
        console.error('No coupon found with code:', trimmedCode);
        throw new Error('Invalid coupon code');
      }

      // Validate the coupon data
      if (!data.percentage || typeof data.percentage !== 'number' || data.percentage <= 0) {
        console.error('Invalid coupon percentage:', data.percentage);
        throw new Error('Invalid coupon discount');
      }
      
      // Ensure percentage is within reasonable bounds (0-100)
      if (data.percentage > 100) {
        console.error('Coupon percentage too high:', data.percentage);
        throw new Error('Invalid coupon discount');
      }

      console.log('Valid coupon found:', data);

      return {
        id: data.id,
        code: data.code,
        percentage: data.percentage
      };
    } catch (error) {
      console.error('Error in validateCoupon:', error);
      return rejectWithValue(error.message || 'Invalid coupon code');
    }
  }
);

const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCoupon: (state) => {
      state.currentCoupon = null;
    },
    setCurrentCoupon: (state, action) => {
      state.currentCoupon = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCoupon = action.payload;
        state.error = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentCoupon = null;
      });
  }
});

export const { clearError, clearCurrentCoupon, setCurrentCoupon } = couponsSlice.actions;

export default couponsSlice.reducer;