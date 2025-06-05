import React from 'react';
import { useLocation } from 'react-router-dom';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';

const CatLitter = () => {
  const location = useLocation();
  
  const pageConfig = {
    title: {
      az: 'Pişik Qumları',
      en: 'Cat Litter'
    },
    subtitle: {
      az: 'Pişikləriniz üçün ən keyfiyyətli qumları tapın',
      en: 'Find the highest quality litter for your cats'
    },
    icon: '🏺',
    searchPlaceholder: {
      az: 'Pişik qumu axtar...',
      en: 'Search cat litter...'
    }
  };

  const filterParams = { 
    main_name: 'cat',
    main_category: 'cat litter'
  };

  const customFilters = [
    (product) => {
      return product.main_name === 'cat' && 
             (product.main_category === 'cat litter' || 
              product.categoryAz?.toLowerCase().includes('qum') ||
              product.categoryEn?.toLowerCase().includes('litter'));
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

export default CatLitter;