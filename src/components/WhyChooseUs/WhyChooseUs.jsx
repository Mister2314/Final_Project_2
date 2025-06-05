import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './WhyChooseUs.module.css';

const WhyChooseUs = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🚚',
      title: t('whyChooseUs.features.delivery.title'),
      description: t('whyChooseUs.features.delivery.description')
    },
    {
      icon: '⭐',
      title: t('whyChooseUs.features.quality.title'),
      description: t('whyChooseUs.features.quality.description')
    },
    {
      icon: '🔒',
      title: t('whyChooseUs.features.payment.title'),
      description: t('whyChooseUs.features.payment.description')
    },
    {
      icon: '🎁',
      title: t('whyChooseUs.features.offers.title'),
      description: t('whyChooseUs.features.offers.description')
    },
    {
      icon: '💝',
      title: t('whyChooseUs.features.satisfaction.title'),
      description: t('whyChooseUs.features.satisfaction.description')
    },
    {
      icon: '📞',
      title: t('whyChooseUs.features.support.title'),
      description: t('whyChooseUs.features.support.description')
    }
  ];

  return (
    <section className={styles.whyChooseUsSection}>
      <div className={styles.container}>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs; 