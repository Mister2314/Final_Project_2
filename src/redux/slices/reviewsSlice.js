import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-hot-toast';

const initialState = {
  reviews: [],
  productReviews: [],
  userReviews: [],
  loading: false,
  error: null,
  currentReview: null,
};

export const fetchAllReviews = createAsyncThunk(
  'reviews/fetchAllReviews',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products(main_name, image),
          users(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fetch all reviews error:', error);
      return rejectWithValue(error.message || 'Rəyləri yükləmək mümkün olmadı');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      if (!productId) {
        throw new Error('Məhsul ID-si tələb olunur');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users(username)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fetch product reviews error:', error);
      return rejectWithValue(error.message || 'Məhsul rəylərini yükləmək mümkün olmadı');
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('İstifadəçi ID-si tələb olunur');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products(main_name, image)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fetch user reviews error:', error);
      return rejectWithValue(error.message || 'İstifadəçi rəylərini yükləmək mümkün olmadı');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      if (!reviewData || Object.keys(reviewData).length === 0) {
        throw new Error('Rəy məlumatları boş ola bilməz');
      }

      if (!reviewData.product_id) {
        throw new Error('Məhsul ID-si tələb olunur');
      }

      if (!reviewData.user_id) {
        throw new Error('İstifadəçi ID-si tələb olunur');
      }

      if (!reviewData.comment || reviewData.comment.trim() === '') {
        throw new Error('Şərh tələb olunur');
      }

      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Reytinq 1-5 arasında olmalıdır');
      }

      const { data: existingReviews, error: checkError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', reviewData.product_id)
        .eq('user_id', reviewData.user_id);

      if (checkError) throw checkError;

      if (existingReviews && existingReviews.length > 0) {
        throw new Error('Bu məhsul üçün artıq rəy yazmısınız');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: reviewData.product_id,
          user_id: reviewData.user_id,
          comment: reviewData.comment.trim(),
          rating: parseInt(reviewData.rating)
        }])
        .select(`
          *,
          products(main_name, image),
          users(username)
        `);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Rəy yaradılmadı');
      }

      return data[0];
    } catch (error) {
      console.error('Create review error:', error);
      return rejectWithValue(error.message || 'Rəy yaratmaq mümkün olmadı');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Rəy ID-si tələb olunur');
      }

      if (!reviewData || Object.keys(reviewData).length === 0) {
        throw new Error('Yeniləmək üçün məlumat tələb olunur');
      }

      const updateData = {};
      
      if (reviewData.comment !== undefined) {
        if (!reviewData.comment || reviewData.comment.trim() === '') {
          throw new Error('Şərh boş ola bilməz');
        }
        updateData.comment = reviewData.comment.trim();
      }

      if (reviewData.rating !== undefined) {
        if (reviewData.rating < 1 || reviewData.rating > 5) {
          throw new Error('Reytinq 1-5 arasında olmalıdır');
        }
        updateData.rating = parseInt(reviewData.rating);
      }

      const { data, error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          products(main_name, image),
          users(username)
        `);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Rəy tapılmadı və ya yenilənmədi');
      }

      return data[0];
    } catch (error) {
      console.error('Update review error:', error);
      return rejectWithValue(error.message || 'Rəyi yeniləmək mümkün olmadı');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ reviewId, userId }, { rejectWithValue }) => {
    try {
      const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', reviewId)
        .single();

      if (fetchError) throw fetchError;

      if (!review || review.user_id !== userId) {
        throw new Error('Unauthorized to delete this review');
      }

      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (deleteError) throw deleteError;

      return reviewId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getReviewById = createAsyncThunk(
  'reviews/getReviewById',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Rəy ID-si tələb olunur');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products(main_name, image),
          users(username)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get review by ID error:', error);
      return rejectWithValue(error.message || 'Rəyi tapmaq mümkün olmadı');
    }
  }
);

export const getProductAverageRating = createAsyncThunk(
  'reviews/getProductAverageRating',
  async (productId, { rejectWithValue }) => {
    try {
      if (!productId) {
        throw new Error('Məhsul ID-si tələb olunur');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { productId, averageRating: 0, totalReviews: 0 };
      }

      const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / data.length;

      return {
        productId,
        averageRating: Math.round(averageRating * 10) / 10, 
        totalReviews: data.length
      };
    } catch (error) {
      console.error('Get product average rating error:', error);
      return rejectWithValue(error.message || 'Məhsul reytinqini hesablamaq mümkün olmadı');
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    clearProductReviews: (state) => {
      state.productReviews = [];
    },
    clearUserReviews: (state) => {
      state.userReviews = [];
    },
    addReview: (state, action) => {
      state.reviews.unshift(action.payload);
    },
    updateReviewLocal: (state, action) => {
      const index = state.reviews.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
      
      const productIndex = state.productReviews.findIndex(r => r.id === action.payload.id);
      if (productIndex !== -1) {
        state.productReviews[productIndex] = action.payload;
      }
      
      const userIndex = state.userReviews.findIndex(r => r.id === action.payload.id);
      if (userIndex !== -1) {
        state.userReviews[userIndex] = action.payload;
      }
    },
    removeReview: (state, action) => {
      state.reviews = state.reviews.filter(r => r.id !== action.payload);
      state.productReviews = state.productReviews.filter(r => r.id !== action.payload);
      state.userReviews = state.userReviews.filter(r => r.id !== action.payload);
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
        state.error = null;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload;
        state.error = null;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload;
        state.error = null;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.productReviews.unshift(action.payload);
        state.error = null;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        
        const reviewId = action.payload.id;
                const allReviewsIndex = state.reviews.findIndex(r => r.id === reviewId);
        if (allReviewsIndex !== -1) {
          state.reviews[allReviewsIndex] = action.payload;
        }
        
        const productReviewsIndex = state.productReviews.findIndex(r => r.id === reviewId);
        if (productReviewsIndex !== -1) {
          state.productReviews[productReviewsIndex] = action.payload;
        }
        
        const userReviewsIndex = state.userReviews.findIndex(r => r.id === reviewId);
        if (userReviewsIndex !== -1) {
          state.userReviews[userReviewsIndex] = action.payload;
        }
        
        if (state.currentReview && state.currentReview.id === reviewId) {
          state.currentReview = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const reviewId = action.payload;
        
        state.reviews = state.reviews.filter(r => r.id !== reviewId);
        state.productReviews = state.productReviews.filter(r => r.id !== reviewId);
        state.userReviews = state.userReviews.filter(r => r.id !== reviewId);
        
        if (state.currentReview && state.currentReview.id === reviewId) {
          state.currentReview = null;
        }
        
        state.error = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload;
        state.error = null;
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getProductAverageRating.fulfilled, (state, action) => {
        state.error = null;
      })
      .addCase(getProductAverageRating.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentReview,
  clearProductReviews,
  clearUserReviews,
  addReview,
  updateReviewLocal,
  removeReview,
  clearReviews
} = reviewsSlice.actions;

export default reviewsSlice.reducer;