import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsArrowRight, BsPaw } from 'react-icons/bs';
import styles from './HomeHero.module.css';

const HomeHero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3
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

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { scale: 0.95 }
  };

  const handleExplore = () => {
    navigate('/shop');
  };

  return (
    <motion.div 
      className={styles.heroContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={styles.heroContent}>
        <motion.div className={styles.textContent} variants={itemVariants}>
          <motion.h1 
            className={styles.title}
            variants={itemVariants}
          >
            {t('home.hero.title')}
            <motion.span 
              className={styles.highlight}
              animate={{ 
                backgroundSize: ["0% 100%", "100% 100%"],
                opacity: [0, 1] 
              }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {t('home.hero.highlight')}
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className={styles.subtitle}
            variants={itemVariants}
          >
            {t('home.hero.subtitle')}
          </motion.p>

          <motion.div 
            className={styles.buttonGroup}
            variants={itemVariants}
          >
            <motion.button
              className={styles.exploreButton}
              onClick={handleExplore}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t('home.hero.exploreButton')}
              <BsArrowRight className={styles.buttonIcon} />
            </motion.button>

            <motion.div 
              className={styles.statsGroup}
              variants={itemVariants}
            >
              <div className={styles.statItem}>
                <span className={styles.statValue}>2000+</span>
                <span className={styles.statLabel}>{t('home.hero.products')}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>500+</span>
                <span className={styles.statLabel}>{t('home.hero.brands')}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className={styles.imageContent}
          variants={itemVariants}
        >
          <motion.div 
            className={styles.mainImage}
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <img src="/images/hero-pet.png" alt="Happy Pet" />
          </motion.div>

          <motion.div 
            className={styles.floatingElement}
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <BsPaw />
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className={styles.scrollIndicator}
        animate={{ 
          y: [0, 10, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className={styles.mouse}>
          <div className={styles.wheel} />
        </div>
        <p>{t('home.hero.scrollText')}</p>
      </motion.div>
    </motion.div>
  );
};

export default HomeHero; 