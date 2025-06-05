import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogFoods = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'food'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      pageConfig={{
        title: {
          az: t('dogs.categories.food'),
          en: t('dogs.categories.food')
        },
        subtitle: {
          az: t('dogs.categories.foodDescription', { defaultValue: 'İtiniz üçün keyfiyyətli və sağlam qidalar' }),
          en: t('dogs.categories.foodDescription', { defaultValue: 'Quality and healthy food for your dog' })
        },
        icon: '🍖',
        searchPlaceholder: {
          az: t('dogs.searchPlaceholder'),
          en: t('dogs.searchPlaceholder')
        }
      }}
      filterParams={{
        main_name: 'dog',
        main_category: 'food'
      }}
      showStockFilter={true}
      customStyles={styles}
    />
  );
};

export default DogFoods; 