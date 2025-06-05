import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './FeaturedBrands.module.css';

const brands = [
  {
    id: 1,
    name: 'Royal Canin',
    logo: 'https://raw.githubusercontent.com/your-username/project-assets/main/royal-canin.png',
    discount: '25%',
    description: {
      en: 'Premium nutrition for your pets',
      az: 'Heyvanlarınız üçün premium qidalanma'
    }
  },
  {
    id: 2,
    name: 'Whiskas',
    logo: 'https://raw.githubusercontent.com/your-username/project-assets/main/whiskas.png',
    discount: '20%',
    description: {
      en: 'Delicious cat food and treats',
      az: 'Dadlı pişik yeməkləri'
    }
  },
  {
    id: 3,
    name: 'Pedigree',
    logo: 'https://raw.githubusercontent.com/your-username/project-assets/main/pedigree.png',
    discount: '30%',
    description: {
      en: 'Complete dog nutrition',
      az: 'Tam it qidalanması'
    }
  },
  {
    id: 4,
    name: 'Hills',
    logo: 'https://raw.githubusercontent.com/your-username/project-assets/main/hills.png',
    discount: '15%',
    description: {
      en: 'Science-based nutrition',
      az: 'Elmə əsaslanan qidalanma'
    }
  }
];

const FeaturedBrands = () => {
  const { t, i18n } = useTranslation();
  const [hoveredBrand, setHoveredBrand] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const brandVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const discountVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.3,
        rotate: {
          repeat: Infinity,
          duration: 1.5
        }
      }
    }
  };

  return (
    <section className={styles.brandsSection}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>
            {t('featuredBrands.title')}
            <span className={styles.titleAccent}>
              {t('featuredBrands.titleAccent')}
            </span>
          </h2>
          <p className={styles.subtitle}>{t('featuredBrands.subtitle')}</p>
        </motion.div>

        <motion.div
          className={styles.brandsGrid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {brands.map((brand) => (
            <motion.div
              key={brand.id}
              className={styles.brandCard}
              variants={brandVariants}
              onHoverStart={() => setHoveredBrand(brand.id)}
              onHoverEnd={() => setHoveredBrand(null)}
              whileHover={{ y: -10 }}
            >
              <div className={styles.brandImageContainer}>
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={styles.brandImage}
                />
                <motion.div
                  className={styles.discountBadge}
                  variants={discountVariants}
                  initial="initial"
                  animate={hoveredBrand === brand.id ? "hover" : "initial"}
                >
                  {brand.discount}
                </motion.div>
              </div>
              <div className={styles.brandInfo}>
                <h3 className={styles.brandName}>{brand.name}</h3>
                <p className={styles.brandDescription}>
                  {brand.description[i18n.language] || brand.description.en}
                </p>
                <motion.button
                  className={styles.shopButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('featuredBrands.shopNow')}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBrands; 