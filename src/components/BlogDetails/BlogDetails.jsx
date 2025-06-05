import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getBlogById, clearCurrentBlog } from '../../redux/slices/blogSlice';
import styles from './BlogDetails.module.css';
import Spinner from '../Spinner/Spinner';

const BlogDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { currentBlog, loading, error } = useSelector((state) => state.blogs);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const articleRef = useRef(null);
  const imageRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.8]);
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        await dispatch(getBlogById(id)).unwrap();
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
    window.scrollTo(0, 0);

    // Cleanup function
    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate(-1); 
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Intl.DateTimeFormat(i18n.language === 'az' ? 'az-AZ' : 'en-US', options).format(date);
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
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const getReadTime = (text) => {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const getBlogDescription = () => {
    if (!currentBlog) return '';
    
    const isAzerbaijani = i18n.language === 'az';
    return isAzerbaijani ? 
      currentBlog.blogDescription_az || currentBlog.blogDescription_en : 
      currentBlog.blogDescription_en || currentBlog.blogDescription_az;
  };

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !currentBlog) {
    return (
      <motion.div 
        className={styles.errorContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>{t('blog.error.title')}</h2>
        <p>{t('blog.error.message')}</p>
        <motion.button
          className={styles.backButton}
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>←</span> {t('common.back')}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.blogDetailsContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className={styles.breadcrumbs}>
        <Link to="/" className={styles.breadcrumbLink}>
          <span className={styles.breadcrumbIcon}>🏠</span>
          {t('common.home')}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link to="/blogs" className={styles.breadcrumbLink}>
          <span className={styles.breadcrumbIcon}>📚</span>
          {t('common.blogs')}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{currentBlog.title}</span>
      </nav>

      <div className={styles.blogLayout}>
        <motion.div 
          className={styles.blogImageSection}
          style={{ opacity, scale }}
          ref={imageRef}
        >
          <div className={styles.stickyImageContainer}>
            <motion.img
              src={currentBlog.image}
              alt={currentBlog.title}
              className={styles.blogImage}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ 
                opacity: isImageLoaded ? 1 : 0,
                filter: isImageLoaded ? 'blur(0px)' : 'blur(10px)'
              }}
              transition={{ duration: 0.5 }}
              onLoad={() => setIsImageLoaded(true)}
            />
            {!isImageLoaded && (
              <motion.div 
                className={styles.imagePlaceholder}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
              />
            )}
          </div>
        </motion.div>

        <motion.article 
          className={styles.blogArticle}
          ref={articleRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <header className={styles.blogHeader}>
          <div className={styles.blogMeta}>
              {currentBlog.blogCategory && (
                <motion.span 
                  className={styles.blogCategory}
                  whileHover={{ scale: 1.05 }}
                >
              <span className={styles.categoryIcon}>
                    {getCategoryIcon(currentBlog.blogCategory)}
                  </span>
                  {formatCategory(currentBlog.blogCategory)}
                </motion.span>
              )}
              <span className={styles.blogDate}>
                <span className={styles.dateIcon}>📅</span>
                {formatDate(currentBlog.created_at)}
              </span>
              <span className={styles.readTime}>
              <span className={styles.readTimeIcon}>⏱️</span>
                {getReadTime(currentBlog.content)} {t('blog.minuteRead')}
              </span>
            </div>
            <motion.h1 
              className={styles.blogTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {currentBlog.title}
            </motion.h1>
        </header>

          <motion.div 
            className={styles.blogContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className={styles.blogDescription}>{getBlogDescription()}</p>
          </motion.div>

          <motion.button
            className={styles.backButton}
            onClick={handleBack}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ x: [-5, 0, -5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ←
            </motion.span>
            {t('common.back')}
          </motion.button>
        </motion.article>
        </div>
    </motion.div>
  );
};

export default BlogDetails;