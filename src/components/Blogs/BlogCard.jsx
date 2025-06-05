import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Blogs.module.css';

const BlogCard = ({ blog, isAzerbaijani }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat(isAzerbaijani ? 'az-AZ' : 'en-US', options).format(date);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, text.lastIndexOf(' ', maxLength)) + '...';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'health': '💊',
      'nutrition': '🍖',
      'training': '🦮',
      'grooming': '✂️',
      'behavior': '🐾',
      'lifestyle': '🏠',
      'default': '📝'
    };
    return icons[category?.toLowerCase()] || icons.default;
  };

  const formatCategory = (category) => {
    if (!category) return t('blog.uncategorized');
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const getReadTime = (text) => {
    const wordsPerMinute = 200;
    const words = text?.split(/\s+/)?.length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return t('blogs.readTime', { minutes });
  };

  return (
    <Link to={`/blog/${blog.id}`} className={styles.blogCard}>
      <div className={styles.blogImageContainer}>
        {blog.image ? (
          <img 
            src={blog.image} 
            alt={isAzerbaijani ? blog.blogTitle_az : blog.blogTitle_en}
            className={styles.blogImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>{getCategoryIcon(blog.blogCategory)}</span>
          </div>
        )}
        <div className={styles.categoryBadge}>
          <span className={styles.categoryIcon}>
            {getCategoryIcon(blog.blogCategory)}
          </span>
          {formatCategory(blog.blogCategory)}
        </div>
      </div>

      <div className={styles.blogContent}>
        <h3 className={styles.blogTitle}>
          {truncateText(isAzerbaijani ? blog.blogTitle_az : blog.blogTitle_en, 80)}
        </h3>
        
        <p className={styles.blogDescription}>
          {truncateText(
            isAzerbaijani ? blog.blogDescription_az : blog.blogDescription_en,
            150
          )}
        </p>

        <div className={styles.blogMeta}>
          <div className={styles.metaInfo}>
            <span className={styles.blogDate}>
              <span className={styles.dateIcon}>📅</span>
              {formatDate(blog.created_at)}
            </span>
            <span className={styles.readTime}>
              <span className={styles.readTimeIcon}>⏱️</span>
              {getReadTime(isAzerbaijani ? blog.blogDescription_az : blog.blogDescription_en)}
            </span>
          </div>
          <span className={styles.readMore}>
            {t('blogs.readMore')}
            <span className={styles.readMoreArrow}>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(BlogCard); 