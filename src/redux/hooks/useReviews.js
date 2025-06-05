import { useDispatch, useSelector } from 'react-redux';
import { errorToast, successToast } from '../../utils/toast';
import {
  fetchAllReviews,
  fetchProductReviews,
  fetchUserReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
  getProductAverageRating,
  clearError,
  clearCurrentReview,
  clearProductReviews,
  clearUserReviews
} from '../slices/reviewsSlice';

export const useReviews = () => {
  const dispatch = useDispatch();
  const {
    reviews,
    productReviews,
    userReviews,
    currentReview,
    loading,
    error
  } = useSelector(state => state.reviews);

  const getAllReviews = async () => {
    try {
      const result = await dispatch(fetchAllReviews()).unwrap();
      return { success: true, data: result };
    } catch (error) {
      errorToast('reviews.fetchError');
      return { success: false, error };
    }
  };

  const getProductReviews = async (productId) => {
    try {
      if (!productId) {
        errorToast('reviews.productIdRequired');
        return { success: false, error: 'Product ID required' };
      }

      const result = await dispatch(fetchProductReviews(productId)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      errorToast('reviews.fetchProductReviewsError');
      return { success: false, error };
    }
  };

  const getAverageRating = async (productId) => {
    try {
      const result = await dispatch(getProductAverageRating(productId)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      errorToast('reviews.averageRatingError');
      return { success: false, error };
    }
  };

  const handleClearProductReviews = () => {
    dispatch(clearProductReviews());
  };

  const getUserReviews = async (userId) => {
    try {
      if (!userId) {
        errorToast('reviews.userIdRequired');
        return { success: false, error: 'User ID required' };
      }

      const result = await dispatch(fetchUserReviews(userId)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      errorToast('reviews.fetchUserReviewsError');
      return { success: false, error };
    }
  };

  const addReview = async (reviewData) => {
    try {
      if (!reviewData.product_id) {
        errorToast('reviews.validation.productIdRequired');
        return { success: false, error: 'Product ID required' };
      }

      if (!reviewData.user_id) {
        errorToast('reviews.validation.userIdRequired');
        return { success: false, error: 'User ID required' };
      }

      if (!reviewData.comment || reviewData.comment.trim() === '') {
        errorToast('reviews.validation.commentRequired');
        return { success: false, error: 'Comment required' };
      }

      if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
        errorToast('reviews.validation.ratingInvalid');
        return { success: false, error: 'Rating must be between 1-5' };
      }

      const result = await dispatch(createReview(reviewData)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      errorToast('reviews.addError');
      return { success: false, error };
    }
  };

  const editReview = async (id, reviewData) => {
    try {
      if (!id) {
        errorToast('reviews.validation.reviewIdRequired');
        return { success: false, error: 'Review ID required' };
      }

      if (reviewData.comment !== undefined && reviewData.comment.trim() === '') {
        errorToast('reviews.validation.commentEmpty');
        return { success: false, error: 'Comment cannot be empty' };
      }

      if (reviewData.rating !== undefined && (reviewData.rating < 1 || reviewData.rating > 5)) {
        errorToast('reviews.validation.ratingInvalid');
        return { success: false, error: 'Rating must be between 1-5' };
      }

      const result = await dispatch(updateReview({ id, reviewData })).unwrap();
      successToast('reviews.updateSuccess');
      return { success: true, data: result };
    } catch (error) {
      errorToast('reviews.updateError');
      return { success: false, error };
    }
  };

  const removeReview = async (id) => {
    try {
      if (!id) {
        errorToast('reviews.validation.reviewIdRequired');
        return { success: false, error: 'Review ID required' };
      }

      await dispatch(deleteReview(id)).unwrap();
      successToast('reviews.deleteSuccess');
      return { success: true };
    } catch (error) {
      errorToast('reviews.deleteError');
      return { success: false, error };
    }
  };

  const getReview = async (id) => {
    try {
      if (!id) {
        errorToast('reviews.validation.reviewIdRequired');
        return { success: false, error: 'Review ID required' };
      }

      const result = await dispatch(getReviewById(id)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      errorToast('reviews.fetchError');
      return { success: false, error };
    }
  };

  return {
    reviews,
    productReviews,
    userReviews,
    currentReview,
    loading,
    error,
    getAllReviews,
    getProductReviews,
    getUserReviews,
    addReview,
    editReview,
    removeReview,
    getReview,
    getAverageRating,
    clearProductReviews: handleClearProductReviews
  };
};