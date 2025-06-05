import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsArrowRight, BsDot } from 'react-icons/bs';
import { FaDog, FaCat, FaFish, FaDove } from 'react-icons/fa';
import styles from './FeaturedCategories.module.css';

const FeaturedCategories = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const categories = [
    {
      id: 1,
      name: t('categories.dogs'),
      icon: FaDog,
      color: '#8247f5',
      route: '/dogs',
      items: 250,
      description: t('categories.dogsDesc')
    },
    {
      id: 2,
      name: t('categories.cats'),
      icon: FaCat,
      color: '#ff6b6b',
      route: '/cats',
      items: 200,
      description: t('categories.catsDesc')
    },
    {
      id: 3,
      name: t('categories.fish'),
      icon: FaFish,
      color: '#4dabf7',
      route: '/fish',
      items: 100,
      description: t('categories.fishDesc')
    },
    {
      id: 4,
      name: t('categories.birds'),
      icon: FaDove,
      color: '#51cf66',
      route: '/birds',
      items: 150,
      description: t('categories.birdsDesc')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleCategoryClick = (route) => {
    navigate(route);
  };

  return (
    <section className={styles.categoriesSection}>
      <motion.div 
        className={styles.container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div 
          className={styles.header}
          variants={itemVariants}
        >
          <div className={styles.titleWrapper}>
            <h2 className={styles.title}>
              {t('categories.title')}
              <BsDot className={styles.titleDot} />
            </h2>
            <p className={styles.subtitle}>{t('categories.subtitle')}</p>
          </div>
        </motion.div>

        <motion.div 
          className={styles.categoriesGrid}
          variants={containerVariants}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            
            return (
              <motion.div
                key={category.id}
                className={styles.categoryCard}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                onClick={() => handleCategoryClick(category.route)}
                style={{
                  '--category-color': category.color
                }}
              >
                <div className={styles.cardContent}>
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                  </div>
                  
                  <h3 className={styles.categoryName}>
                    {category.name}
                  </h3>
                  
                  <p className={styles.categoryDescription}>
                    {category.description}
                  </p>
                  
                  <div className={styles.categoryMeta}>
                    <span className={styles.itemCount}>
                      {category.items}+ {t('categories.items')}
                    </span>
                  </div>

                  <motion.button 
                    className={styles.exploreButton}
                    whileHover={{ 
                      x: 5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {t('categories.explore')}
                    <BsArrowRight className={styles.buttonIcon} />
                  </motion.button>
                </div>

                <div className={styles.cardBackground} />
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturedCategories; 