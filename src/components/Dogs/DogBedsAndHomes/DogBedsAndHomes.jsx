import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogBedsAndHomes = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'bed'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      pageConfig={{
        title: {
          az: t('dogs.categories.beds'),
          en: t('dogs.categories.beds')
        },
        subtitle: {
          az: t('dogs.categories.bedsDescription', { defaultValue: 'Sevimli itiniz üçün rahat yataq və evlər' }),
          en: t('dogs.categories.bedsDescription', { defaultValue: 'Comfortable beds and homes for your beloved dog' })
        },
        icon: '🏠',
        searchPlaceholder: {
          az: t('dogs.searchPlaceholder'),
          en: t('dogs.searchPlaceholder')
        }
      }}
      filterParams={{
        main_name: 'dog',
        main_category: 'bed'
      }}
      showStockFilter={true}
      customStyles={styles}
    />
  );
};

export default DogBedsAndHomes; 