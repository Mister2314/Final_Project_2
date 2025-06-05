import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductsTemplate from '../ProductsTemplate/ProductsTemplate';
import styles from './AllProducts.module.css';

const AllProducts = () => {
  const { t } = useTranslation();

  const pageConfig = {
    title: {
      az: t('products.title'),
      en: t('products.title')
    },
    subtitle: {
      az: t('products.subtitle'),
      en: t('products.subtitle')
    },
    icon: '🐾',
    searchPlaceholder: {
      az: t('products.searchPlaceholder'),
      en: t('products.searchPlaceholder')
    }
  };

  return (
    <div className={styles.allProductsContainer}>
      <ProductsTemplate
        pageConfig={pageConfig}
        showCategoryFilter={true}
        showStockFilter={true}
      />
    </div>
  );
};

export default AllProducts; 