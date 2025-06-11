import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './PetCategories.module.css';

const PetCategories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories = [
    {
      id: 'dogs',
      name: t('petCategories.categories.dogs.name'),
      icon: '🐕',
      route: t('petCategories.categories.dogs.route'),
      color: 'linear-gradient(135deg, #FF6B6B, #FF8787)'
    },
    {
      id: 'cats',
      name: t('petCategories.categories.cats.name'),
      icon: '🐱',
      route: t('petCategories.categories.cats.route'),
      color: 'linear-gradient(135deg, #8247f5, #a066ff)'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: 20, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <motion.div 
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>🐾</span>
            {t('petCategories.title')}
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('petCategories.subtitle')}
          </p>
        </motion.div>

        <motion.div 
          className={styles.categoriesGrid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className={styles.categoryCard}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              onClick={() => navigate(category.route)}
              data-category={category.id}
            >
              <div className={styles.categoryIcon}>{category.icon}</div>
              <h3 className={styles.categoryName}>{category.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PetCategories; 