import React from 'react';
import { useLocation } from 'react-router-dom';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';

const CatCarriers = () => {
  const location = useLocation();
  
  const pageConfig = {
    title: {
      az: 'Pişik Daşıyıcıları',
      en: 'Cat Carriers'
    },
    subtitle: {
      az: 'Pişiklərinizi təhlükəsiz daşımaq üçün keyfiyyətli daşıyıcılar',
      en: 'Quality carriers for safe transportation of your cats'
    },
    icon: '👜', 
    searchPlaceholder: {
      az: 'Pişik daşıyıcısı axtar...',
      en: 'Search cat carriers...'
    }
  };

  const filterParams = {
    main_name: 'cat',
    main_category: 'carrier'
  };

  const customFilters = [
    (product) => {
      return product.main_name === 'cat' && product.main_category === 'carrier';
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

export default CatCarriers;