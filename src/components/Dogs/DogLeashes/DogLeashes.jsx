import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogLeashes = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'leash'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      pageConfig={{
        title: {
          az: t('dogs.categories.leashes'),
          en: t('dogs.categories.leashes')
        },
        subtitle: {
          az: t('dogs.categories.leashesDescription', { defaultValue: 'İtiniz üçün rahat və davamlı qayışlar' }),
          en: t('dogs.categories.leashesDescription', { defaultValue: 'Comfortable and durable leashes for your dog' })
        },
        icon: '🦮',
        searchPlaceholder: {
          az: t('dogs.searchPlaceholder'),
          en: t('dogs.searchPlaceholder')
        }
      }}
      filterParams={{
        main_name: 'dog',
        main_category: 'leash'
      }}
      showStockFilter={true}
      customStyles={styles}
    />
  );
};

export default DogLeashes; 