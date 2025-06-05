import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPackage, FiStar, FiClock, FiHeart, FiShield, FiSmile } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import styles from './AboutUs.module.css';

const AboutUs = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  const stats = [
    { icon: <FiUsers />, ...t('aboutUs.stats.happyCustomers', { returnObjects: true }) },
    { icon: <FiPackage />, ...t('aboutUs.stats.products', { returnObjects: true }) },
    { icon: <FiStar />, ...t('aboutUs.stats.satisfaction', { returnObjects: true }) },
    { icon: <FiClock />, ...t('aboutUs.stats.support', { returnObjects: true }) }
  ];

  const values = [
    {
      icon: <FiHeart />,
      ...t('aboutUs.values.items.petLove', { returnObjects: true })
    },
    {
      icon: <FiShield />,
      ...t('aboutUs.values.items.quality', { returnObjects: true })
    },
    {
      icon: <FiSmile />,
      ...t('aboutUs.values.items.satisfaction', { returnObjects: true })
    }
  ];

  const team = [
    t('aboutUs.team.members.director', { returnObjects: true }),
    t('aboutUs.team.members.veterinary', { returnObjects: true }),
    t('aboutUs.team.members.customerService', { returnObjects: true })
  ];

  return (
    <div className={styles.aboutPage}>
      <Header />

      <motion.section 
        className={styles.hero}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className={styles.heroContent} variants={itemVariants}>
          <span className={styles.sectionTag}>{t('aboutUs.hero.tag')}</span>
          <h1>{t('aboutUs.hero.title')}</h1>
          <p>{t('aboutUs.hero.description')}</p>
        </motion.div>
      </motion.section>

      <motion.section 
        className={styles.stats}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className={styles.statCard}
                variants={itemVariants}
              >
                <div className={styles.statIcon}>{stat.icon}</div>
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section 
        className={styles.values}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className={styles.container}>
          <motion.div className={styles.sectionHeader} variants={itemVariants}>
            <span className={styles.sectionTag}>{t('aboutUs.values.sectionTag')}</span>
            <h2>{t('aboutUs.values.title')}</h2>
          </motion.div>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className={styles.valueCard}
                variants={itemVariants}
              >
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section 
        className={styles.team}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className={styles.container}>
          <motion.div className={styles.sectionHeader} variants={itemVariants}>
            <span className={styles.sectionTag}>{t('aboutUs.team.sectionTag')}</span>
            <h2>{t('aboutUs.team.title')}</h2>
          </motion.div>
          <div className={styles.teamGrid}>
            {team.map((member, index) => (
              <motion.div 
                key={index}
                className={styles.teamCard}
                variants={itemVariants}
              >
                <div className={styles.teamImageContainer}>
                  <img 
                    src={member.imageUrl} 
                    alt={member.name}
                    className={styles.teamImage}
                  />
                </div>
                <div className={styles.teamInfo}>
                  <h3>{member.name}</h3>
                  <span className={styles.role}>{member.role}</span>
                  <p>{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section 
        className={styles.contact}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className={styles.container}>
          <motion.div className={styles.contactContent} variants={itemVariants}>
            <h2>{t('aboutUs.contact.title')}</h2>
            <p>{t('aboutUs.contact.description')}</p>
            <div className={styles.contactButtons}>
              <motion.button 
                className={styles.primaryButton}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(130, 71, 245, 0.3)" }}
                whileTap={{ y: -2 }}
              >
                {t('aboutUs.contact.buttons.contact')}
              </motion.button>
              <motion.button 
                className={styles.secondaryButton}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ y: -2 }}
              >
                {t('aboutUs.contact.buttons.moreInfo')}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default AboutUs;