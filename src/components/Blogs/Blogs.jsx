import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchBlogs } from '../../redux/slices/blogSlice';
import styles from './Blogs.module.css';
import BlogCard from './BlogCard';
import Spinner from '../Spinner/Spinner';

const Blogs = () => {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.blogs);
  const { t, i18n } = useTranslation();
  const isAzerbaijani = i18n.language === 'az';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const filteredBlogs = useMemo(() => {
    if (!blogs) return [];

    return blogs.filter(blog => {
      const matchesSearch = (blog.blogTitle_az?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (blog.blogTitle_en?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (blog.blogDescription_az?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (blog.blogDescription_en?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      return matchesSearch;
    }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
      case 'az':
          return (a.blogTitle_en || '').localeCompare(b.blogTitle_en || '');
      case 'za':
          return (b.blogTitle_en || '').localeCompare(a.blogTitle_en || '');
        case 'newest':
      default:
          return new Date(b.created_at) - new Date(a.created_at);
    }
    });
  }, [blogs, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.blogsContainer}>
        <div className={styles.blogsHeader}>
        <h1 className={styles.blogsTitle}>
          {t('blogs.title')}
          </h1>
        <div className={styles.blogsControls}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder={t('blogs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`${styles.searchInput} ${isSearchFocused ? styles.focused : ''}`}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>

          <div className={styles.filterContainer}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="newest">{t('blogs.sort.latest')}</option>
              <option value="oldest">{t('blogs.sort.oldest')}</option>
              <option value="az">{t('blogs.sort.az')}</option>
              <option value="za">{t('blogs.sort.za')}</option>
              </select>
            </div>
          </div>
        </div>

          <div className={styles.blogsGrid}>
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                isAzerbaijani={isAzerbaijani}
              />
          ))
        ) : (
          <div className={styles.noBlogs}>
            <span className={styles.noBlogsIcon}>📝</span>
            <h2>{t('blogs.noResults.title')}</h2>
            <p>{t('blogs.noResults.description')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs; 