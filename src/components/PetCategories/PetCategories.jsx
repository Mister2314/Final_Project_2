import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './PetCategories.module.css';

const PetCategories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories = [
    {
      id: 'dogs',
      name: t('petCategories.categories.dogs.name'),
      icon: '🐕',
      bgColor: '#FFE5D9',
      route: t('petCategories.categories.dogs.route')
    },
    {
      id: 'cats',
      name: t('petCategories.categories.cats.name'),
      icon: '🐱',
      bgColor: '#FFE0E9',
      route: t('petCategories.categories.cats.route')
    },
  ];

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>🐾</span>
            {t('petCategories.title')}
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('petCategories.subtitle')}
          </p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <div
              key={category.id}
              className={styles.categoryCard}
              style={{ backgroundColor: category.bgColor }}
              onClick={() => navigate(category.route)}
            >
              <div className={styles.categoryIcon}>{category.icon}</div>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetCategories; 