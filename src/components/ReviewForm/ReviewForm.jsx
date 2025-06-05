import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BsPersonCheck, BsStarFill, BsStar } from 'react-icons/bs';
import debounce from 'lodash/debounce';
import styles from './ReviewForm.module.css';

const ReviewForm = React.memo(({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const handleCommentChange = useCallback((e) => {
    const value = e.target.value;
    requestAnimationFrame(() => {
      setReviewData(prev => ({ ...prev, comment: value }));
    });
  }, []);

  const handleRatingChange = useCallback((rating) => {
    setReviewData(prev => ({ ...prev, rating }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(reviewData);
      setReviewData({ rating: 5, comment: '' });
    } finally {
      setSubmitting(false);
    }
  }, [reviewData, submitting, onSubmit]);

  const renderStars = useMemo(() => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`${styles.star} ${styles.starInteractive} ${i <= reviewData.rating ? styles.starFilled : styles.starEmpty}`}
          onClick={() => handleRatingChange(i)}
        >
          {i <= reviewData.rating ? <BsStarFill /> : <BsStar />}
        </button>
      );
    }
    return <div className={styles.starsContainer}>{stars}</div>;
  }, [reviewData.rating, handleRatingChange]);

  return (
    <div className={styles.reviewFormCard}>
      <form onSubmit={handleSubmit} className={styles.reviewForm}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            {t('reviews.rating')}
          </label>
          {renderStars}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            {t('reviews.comment')}
          </label>
          <textarea
            ref={textareaRef}
            value={reviewData.comment}
            onChange={handleCommentChange}
            placeholder={t('reviews.commentPlaceholder')}
            className={styles.reviewTextarea}
            rows={4}
            required
          />
        </div>
        
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !reviewData.comment.trim()}
            className={styles.submitButton}
          >
            {submitting 
              ? t('common.submitting')
              : t('common.submit')
            }
          </button>
        </div>
      </form>
    </div>
  );
});

ReviewForm.displayName = 'ReviewForm';

export default ReviewForm; 