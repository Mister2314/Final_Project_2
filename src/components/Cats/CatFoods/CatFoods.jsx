import React from 'react';
import { useLocation } from 'react-router-dom';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';

const CatFoods = () => {
  const location = useLocation();
  
  const pageConfig = {
    title: {
      az: 'Pişik Yeməkləri',
      en: 'Cat Foods'
    },
    subtitle: {
      az: 'Pişikləriniz üçün ən dadlı və qidalı yeməkləri tapın',
      en: 'Find the most delicious and nutritious food for your cats'
    },
    icon: '🍽️', 
    searchPlaceholder: {
      az: 'Pişik yeməyi axtar...',
      en: 'Search cat food...'
    }
  };

  const filterParams = { 
    main_name: 'cat',
    main_category: 'food'
  };

  const customFilters = [
    (product) => {
      return product.main_name === 'cat' && product.main_category === 'food';
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

export default CatFoods;