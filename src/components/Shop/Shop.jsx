import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import styles from './Shop.module.css';

const Shop = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const petCategories = [
    {
      id: 'cats',
      name: t('petCategories.categories.cats.name'),
      subtitle: t('shop.categories.cats.subtitle'),
      icon: '🐱',
      route: '/shop/cats',
      description: t('shop.categories.cats.description')
    },
    {
      id: 'dogs',
      name: t('petCategories.categories.dogs.name'),
      subtitle: t('shop.categories.dogs.subtitle'),
      icon: '🐕',
      route: '/shop/dogs',
      description: t('shop.categories.dogs.description')
    },
    {
      id: 'all',
      name: t('petCategories.categories.all.name'),
      subtitle: t('petCategories.categories.all.subtitle'),
      icon: '🛍️',
      route: '/shop/all-products',
      description: t('petCategories.categories.all.description')
    }
  ];

  const handleCategorySelect = (route) => {
    navigate(route);
  };

  return (
    <div className={styles.shopPageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.petIcon}>🐾</span>
              {t('shop.hero.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('shop.hero.subtitle')}
            </p>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>{t('shop.categories.title')}</h2>
            <div className={styles.categoriesGrid}>
              {petCategories.map((category) => (
                <div
                  key={category.id}
                  className={`${styles.categoryCard} ${styles[category.id]}`}
                  onClick={() => handleCategorySelect(category.route)}
                >
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categorySubtitle}>{category.subtitle}</p>
                  <p className={styles.categoryDescription}>{category.description}</p>
                  <div className={styles.categoryBadge}>
                    {t('shop.categories.viewProducts')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.featuresSection}>
            <h2 className={styles.sectionTitle}>{t('shop.features.title')}</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🏆</div>
                <h3 className={styles.featureTitle}>{t('shop.features.quality.title')}</h3>
                <p className={styles.featureDescription}>
                  {t('shop.features.quality.description')}
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🚚</div>
                <h3 className={styles.featureTitle}>{t('shop.features.delivery.title')}</h3>
                <p className={styles.featureDescription}>
                  {t('shop.features.delivery.description')}
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💰</div>
                <h3 className={styles.featureTitle}>{t('shop.features.prices.title')}</h3>
                <p className={styles.featureDescription}>
                  {t('shop.features.prices.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;