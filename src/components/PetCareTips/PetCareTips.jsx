import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BsThermometerHigh,
  BsSnow,
  BsUmbrella,
  BsSun,
  BsShield,
  BsHeart,
  BsClock
} from 'react-icons/bs';
import styles from './PetCareTips.module.css';

const seasons = [
  {
    id: 'summer',
    icon: BsSun,
    color: '#FF6B6B'
  },
  {
    id: 'winter',
    icon: BsSnow,
    color: '#4DABF7'
  },
  {
    id: 'spring',
    icon: BsUmbrella,
    color: '#69DB7C'
  },
  {
    id: 'autumn',
    icon: BsThermometerHigh,
    color: '#FFA94D'
  }
];

const tips = {
  summer: [
    {
      id: 1,
      icon: BsShield,
      titleKey: 'petCareTips.summer.tip1.title',
      descriptionKey: 'petCareTips.summer.tip1.description'
    },
    {
      id: 2,
      icon: BsHeart,
      titleKey: 'petCareTips.summer.tip2.title',
      descriptionKey: 'petCareTips.summer.tip2.description'
    },
    {
      id: 3,
      icon: BsClock,
      titleKey: 'petCareTips.summer.tip3.title',
      descriptionKey: 'petCareTips.summer.tip3.description'
    }
  ],
  winter: [
    {
      id: 1,
      icon: BsShield,
      titleKey: 'petCareTips.winter.tip1.title',
      descriptionKey: 'petCareTips.winter.tip1.description'
    },
    {
      id: 2,
      icon: BsHeart,
      titleKey: 'petCareTips.winter.tip2.title',
      descriptionKey: 'petCareTips.winter.tip2.description'
    },
    {
      id: 3,
      icon: BsClock,
      titleKey: 'petCareTips.winter.tip3.title',
      descriptionKey: 'petCareTips.winter.tip3.description'
    }
  ],
  spring: [
    {
      id: 1,
      icon: BsShield,
      titleKey: 'petCareTips.spring.tip1.title',
      descriptionKey: 'petCareTips.spring.tip1.description'
    },
    {
      id: 2,
      icon: BsHeart,
      titleKey: 'petCareTips.spring.tip2.title',
      descriptionKey: 'petCareTips.spring.tip2.description'
    },
    {
      id: 3,
      icon: BsClock,
      titleKey: 'petCareTips.spring.tip3.title',
      descriptionKey: 'petCareTips.spring.tip3.description'
    }
  ],
  autumn: [
    {
      id: 1,
      icon: BsShield,
      titleKey: 'petCareTips.autumn.tip1.title',
      descriptionKey: 'petCareTips.autumn.tip1.description'
    },
    {
      id: 2,
      icon: BsHeart,
      titleKey: 'petCareTips.autumn.tip2.title',
      descriptionKey: 'petCareTips.autumn.tip2.description'
    },
    {
      id: 3,
      icon: BsClock,
      titleKey: 'petCareTips.autumn.tip3.title',
      descriptionKey: 'petCareTips.autumn.tip3.description'
    }
  ]
};

const PetCareTips = () => {
  const { t } = useTranslation();
  const [selectedSeason, setSelectedSeason] = useState('summer');
  const [hoveredTip, setHoveredTip] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  const handleSeasonChange = (newSeason) => {
    if (newSeason === selectedSeason) return;
    setIsChanging(true);
    setSelectedSeason(newSeason);
    setTimeout(() => setIsChanging(false), 500);
  };

  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const tipVariants = {
    hidden: { 
      y: 20, 
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: {
      scale: 0,
      rotate: -180
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className={styles.tipsSection}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.title}>
            {t('petCareTips.title')}
            <span className={styles.titleAccent}>
              {t('petCareTips.titleAccent')}
            </span>
          </h2>
          <p className={styles.subtitle}>{t('petCareTips.subtitle')}</p>
        </motion.div>

        <div className={styles.seasonSelector}>
          {seasons.map((season) => {
            const SeasonIcon = season.icon;
            return (
              <motion.button
                key={season.id}
                className={`${styles.seasonButton} ${
                  selectedSeason === season.id ? styles.active : ''
                }`}
                onClick={() => handleSeasonChange(season.id)}
                style={{
                  '--season-color': season.color
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isChanging}
              >
                <SeasonIcon className={styles.seasonIcon} />
                <span>{t(`petCareTips.seasons.${season.id}`)}</span>
              </motion.button>
            );
          })}
        </div>

        <div className={styles.tipsContainer}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedSeason}
              className={styles.tipsGrid}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {tips[selectedSeason].map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <motion.div
                    key={`${selectedSeason}-${tip.id}`}
                    className={styles.tipCard}
                    variants={tipVariants}
                    whileHover="hover"
                    onHoverStart={() => setHoveredTip(tip.id)}
                    onHoverEnd={() => setHoveredTip(null)}
                    layout
                  >
                    <div className={styles.tipContent}>
                      <motion.div
                        className={styles.tipIcon}
                        variants={iconVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                      >
                        <TipIcon />
                      </motion.div>
                      <motion.h3 
                        className={styles.tipTitle}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        {t(tip.titleKey)}
                      </motion.h3>
                      <motion.p 
                        className={styles.tipDescription}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        {t(tip.descriptionKey)}
                      </motion.p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default PetCareTips; 