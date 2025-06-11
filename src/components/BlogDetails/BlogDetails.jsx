import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { getBlogById, clearCurrentBlog } from '../../redux/slices/blogSlice';
import styles from './BlogDetails.module.css';
import Spinner from '../Spinner/Spinner';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';

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
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
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

  const getBlogDescription = () => {
    if (!currentBlog) return '';
    
    const isAzerbaijani = i18n.language === 'az';
    return isAzerbaijani ? 
      currentBlog.blogDescription_az || currentBlog.blogDescription_en : 
      currentBlog.blogDescription_en || currentBlog.blogDescription_az;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.spinnerContainer}>
          <Spinner size="large" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !currentBlog) {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <motion.div 
        className={styles.blogDetailsContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
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

            <div className={styles.blogContent}>
              <p className={styles.blogDescription}>
                {getBlogDescription()}
              </p>
            </div>

            <motion.button
              className={styles.backButton}
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>←</span> {t('common.back')}
            </motion.button>
          </motion.article>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default BlogDetails;