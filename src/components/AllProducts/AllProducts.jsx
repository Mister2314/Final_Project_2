import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductsTemplate from '../ProductsTemplate/ProductsTemplate';
import styles from './AllProducts.module.css';

const AllProducts = () => {
  const { t } = useTranslation();
  const [petType, setPetType] = useState('all');

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

  const smartFilters = [
    {
      field: 'main_name',
      title: t('allProducts.filters.petType.title'),
      icon: '🐾',
      value: petType,
      onChange: (value) => setPetType(value),
      options: [
        { value: 'all', label: t('allProducts.filters.petType.all') },
        { value: 'cat', label: t('allProducts.filters.petType.cats') },
        { value: 'dog', label: t('allProducts.filters.petType.dogs') }
      ]
    }
  ];

  const filterParams = {
    main_name: petType === 'all' ? undefined : petType
  };

  return (
    <div className={styles.allProductsContainer}>
      <ProductsTemplate
        pageConfig={pageConfig}
        filterParams={filterParams}
        showCategoryFilter={true}
        showStockFilter={true}
        smartFilters={smartFilters}
      />
    </div>
  );
};

export default AllProducts; 