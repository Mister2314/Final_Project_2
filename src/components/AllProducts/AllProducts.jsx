import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductsTemplate from '../ProductsTemplate/ProductsTemplate';
import styles from './AllProducts.module.css';

const AllProducts = () => {
  const { t } = useTranslation();
  const [selectedPet, setSelectedPet] = useState('all');

  const pageConfig = {
    title: t('allProducts.title'),
    subtitle: t('allProducts.subtitle'),
    icon: '🐾',
    searchPlaceholder: t('allProducts.searchPlaceholder')
  };

  const filterParams = {
    main_name: selectedPet !== 'all' ? selectedPet : undefined
  };

  const smartFilters = [
    {
      title: t('allProducts.filters.petType.title'),
      icon: '🐾',
      options: [
        { value: 'all', label: t('allProducts.filters.petType.all'), count: 0 },
        { value: 'cat', label: t('allProducts.filters.petType.cats'), count: 0 },
        { value: 'dog', label: t('allProducts.filters.petType.dogs'), count: 0 }
      ],
      value: selectedPet,
      onChange: setSelectedPet,
      field: 'main_name'
    }
  ];

  const mainCategoryFilters = [
    { value: 'food', label: t('allProducts.filters.categories.food'), icon: '🍖' },
    { value: 'toy', label: t('allProducts.filters.categories.toys'), icon: '🎾' },
    { value: 'bed', label: t('allProducts.filters.categories.beds'), icon: '🏠' },
    { value: 'carriers', label: t('allProducts.filters.categories.carriers'), icon: '👜' },
    { value: 'leashes', label: t('allProducts.filters.categories.leashes'), icon: '⛓️' }
  ];

  return (
    <div className={styles.allProductsContainer}>
      <ProductsTemplate
        pageConfig={pageConfig}
        filterParams={filterParams}
        smartFilters={smartFilters}
        mainCategoryFilters={mainCategoryFilters}
        showCategoryFilter={true}
        showStockFilter={true}
      />
    </div>
  );
};

export default AllProducts; 