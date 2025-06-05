import React from 'react';
import { useLocation } from 'react-router-dom';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';

const CatBedsAndHomes = () => {
  const location = useLocation();
  
  const pageConfig = {
    title: {
      az: 'Pişik Yataqları və Evləri',
      en: 'Cat Beds & Homes'
    },
    subtitle: {
      az: 'Pişikləriniz üçün rahat yataq və evlər',
      en: 'Comfortable beds and homes for your cats'
    },
    icon: '🏠', 
    searchPlaceholder: {
      az: 'Pişik yatağı və evi axtar...',
      en: 'Search cat beds & homes...'
    }
  };

  const filterParams = {
    main_name: 'cat',
    main_category: ['cat bed', 'cat house']
  };

  const customFilters = [
    (product) => {
      return product.main_name === 'cat' && 
             (product.main_category === 'cat bed' || 
              product.main_category === 'cat house' ||
              product.categoryAz?.toLowerCase().includes('yataq') ||
              product.categoryAz?.toLowerCase().includes('ev') ||
              product.categoryEn?.toLowerCase().includes('bed') ||
              product.categoryEn?.toLowerCase().includes('house') ||
              product.categoryEn?.toLowerCase().includes('home'));
    }
  ];

  return (
    <ProductsTemplate 
      pageConfig={pageConfig}
      filterParams={filterParams}
      customFilters={customFilters}
      showCategoryFilter={false}
      showStockFilter={true}
    />
  );
};

export default CatBedsAndHomes;