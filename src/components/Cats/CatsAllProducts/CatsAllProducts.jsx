import React from 'react';
import { useLocation } from 'react-router-dom';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';

const CatsAllProducts = () => {
  const location = useLocation();
  
  const isCatsPage = location.pathname.includes('/shop/cats/all-products');
  
  const pageConfig = {
    title: {
      az: isCatsPage ? 'Bütün Pişik Məhsulları' : 'Bütün Məhsullar',
      en: isCatsPage ? 'All Cat Products' : 'All Products'
    },
    subtitle: {
      az: isCatsPage 
        ? 'Pişikləriniz üçün bütün məhsulları kəşf edin'
        : 'Heyvanlarınız üçün bütün məhsulları kəşf edin',
      en: isCatsPage 
        ? 'Discover all products for your cats'
        : 'Discover our complete collection of premium pet products'
    },
    icon: isCatsPage ? '🐱' : '🐾',
    searchPlaceholder: {
      az: 'Məhsul axtar...',
      en: 'Search products...'
    }
  };

  const filterParams = isCatsPage ? { main_name: 'cat' } : {};

  return (
    <ProductsTemplate 
      pageConfig={pageConfig}
      filterParams={filterParams}
      showCategoryFilter={true}
      showStockFilter={true}
    />
  );
};

export default CatsAllProducts;