import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogsAllProducts = () => {
  const dispatch = useDispatch();
  const { categoryId } = useParams();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      ...(categoryId && { main_category: categoryId })
    };
    dispatch(fetchProducts(filters));
  }, [dispatch, categoryId]);

  return (
    <ProductsTemplate
      title="Bütün İt Məhsulları"
      titleEn="All Dog Products"
      description="İtiniz üçün bütün məhsullar bir yerdə"
      descriptionEn="All products for your dog in one place"
      icon="🐕"
      filterParams={{
        main_name: 'dog'
      }}
      showStockFilter={true}
      showCategoryFilter={true}
      pageConfig={{
        title: {
          az: 'Bütün İt Məhsulları',
          en: 'All Dog Products'
        },
        subtitle: {
          az: 'İtiniz üçün bütün məhsullar bir yerdə',
          en: 'All products for your dog in one place'
        },
        icon: '🐕',
        searchPlaceholder: {
          az: 'İt məhsulları axtar...',
          en: 'Search dog products...'
        }
      }}
      customStyles={styles}
    />
  );
};

export default DogsAllProducts; 