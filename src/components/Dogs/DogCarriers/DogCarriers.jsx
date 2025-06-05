import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogCarriers = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'carrier'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      pageConfig={{
        title: {
          az: t('dogs.categories.carriers'),
          en: t('dogs.categories.carriers')
        },
        subtitle: {
          az: t('dogs.categories.carriersDescription', { defaultValue: 'İtiniz üçün rahat və təhlükəsiz daşıma çantaları' }),
          en: t('dogs.categories.carriersDescription', { defaultValue: 'Comfortable and safe carriers for your dog' })
        },
        icon: '👜',
        searchPlaceholder: {
          az: t('dogs.searchPlaceholder'),
          en: t('dogs.searchPlaceholder')
        }
      }}
      filterParams={{
        main_name: 'dog',
        main_category: 'carrier'
      }}
      showStockFilter={true}
      customStyles={styles}
    />
  );
};

export default DogCarriers; 