import React from 'react';
import { useLocation } from 'react-router-dom';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';

const CatLeashes = () => {
  const location = useLocation();
  
  const pageConfig = {
    title: {
      az: 'Pişik Tasmaları',
      en: 'Cat Leashes'
    },
    subtitle: {
      az: 'Pişikləriniz üçün rahat və təhlükəsiz tasmaları kəşf edin',
      en: 'Discover comfortable and safe leashes for your cats'
    },
    icon: '🐈', 
    searchPlaceholder: {
      az: 'Pişik tasması axtar...',
      en: 'Search cat leashes...'
    }
  };

  const filterParams = { 
    main_name: 'cat',
    main_category: 'leash'
  };

  const customFilters = [
    (product) => {
      return product.main_name === 'cat' && product.main_category === 'leash';
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

export default CatLeashes;