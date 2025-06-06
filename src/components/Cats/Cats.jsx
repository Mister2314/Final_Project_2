import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import styles from './Cats.module.css';

const Cats = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  const categories = [
    { id: 'all', name: t('cats.categories.all'), icon: '🐱', route: '/shop/cats/all-products' },
    { id: 'food', name: t('cats.categories.food'), icon: '🍽️', route: '/shop/cats/foods'},
    { id: 'litter', name: t('cats.categories.litter'), icon: '🏠', route: '/shop/cats/litter' },
    { id: 'beds', name: t('cats.categories.beds'), icon: '🛏️', route: '/shop/cats/beds-and-home' },
    { id: 'carriers', name: t('cats.categories.carriers'), icon: '👜', route: '/shop/cats/carriers' },
    { id: 'leashes', name: t('cats.categories.leashes'), icon: '🐈', route: '/shop/cats/leashes' }
  ];

  const handleCategorySelect = (categoryId) => {
    const selectedCat = categories.find(cat => cat.id === categoryId);
    if (selectedCat) {
      navigate(selectedCat.route);
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className={styles.catsPageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.catIcon}>🐱</span>
              {t('cats.hero.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('cats.hero.subtitle')}
            </p>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>{t('cats.categories.title')}</h2>
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`${styles.categoryCard} ${
                    selectedCategory === category.id ? styles.active : ''
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <div className={styles.categoryBadge}>
                    {t('cats.categories.badge.select')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cats;