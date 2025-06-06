import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Blogs.module.css';

const BlogCard = ({ blog, isAzerbaijani }) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
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
    if (!category) return t('blog.categories.uncategorized');
    return t(`blog.categories.${category.toLowerCase()}`);
  };

  return (
    <Link to={`/blog/${blog.id}`} className={styles.blogCard}>
      <div className={styles.blogImageContainer}>
        {blog.image ? (
          <img 
            src={blog.image} 
            alt={isAzerbaijani ? blog.title_az : blog.title_en}
            className={styles.blogImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholderImage}>
            <span>{getCategoryIcon(blog.category)}</span>
          </div>
        )}
        <div className={styles.categoryBadge}>
          <span className={styles.categoryIcon}>
            {getCategoryIcon(blog.category)}
          </span>
          {formatCategory(blog.category)}
        </div>
      </div>

      <div className={styles.blogContent}>
        <h3 className={styles.blogTitle}>
          {truncateText(isAzerbaijani ? blog.title_az : blog.title_en, 80)}
        </h3>
        
        <p className={styles.blogDescription}>
          {truncateText(
            isAzerbaijani ? blog.description_az : blog.description_en,
            150
          )}
        </p>

        <div className={styles.blogMeta}>
          <div className={styles.metaInfo}>
            <span className={styles.blogDate}>
              <span className={styles.dateIcon}>📅</span>
              {formatDate(blog.created_at)}
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