import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogsAllProducts = () => {
  const dispatch = useDispatch();
  const { categoryId } = useParams();
  const { t } = useTranslation();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      ...(categoryId && { main_category: categoryId })
    };
    dispatch(fetchProducts(filters));
  }, [dispatch, categoryId]);

  return (
    <ProductsTemplate
      pageConfig={{
        title: {
          az: t('dogs.categories.all'),
          en: t('dogs.categories.all')
        },
        subtitle: {
          az: t('dogs.subtitle'),
          en: t('dogs.subtitle')
        },
        icon: '🐕',
        searchPlaceholder: {
          az: t('dogs.searchPlaceholder'),
          en: t('dogs.searchPlaceholder')
        }
      }}
      filterParams={{
        main_name: 'dog'
      }}
      showStockFilter={true}
      showCategoryFilter={true}
      customStyles={styles}
    />
  );
};

export default DogsAllProducts; 