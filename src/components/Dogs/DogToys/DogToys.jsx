import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogToys = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'toy'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      pageConfig={{
        title: {
          az: t('dogs.categories.toys'),
          en: t('dogs.categories.toys')
        },
        subtitle: {
          az: t('dogs.categories.toysDescription', { defaultValue: 'İtiniz üçün əyləncəli və təhlükəsiz oyuncaqlar' }),
          en: t('dogs.categories.toysDescription', { defaultValue: 'Fun and safe toys for your dog' })
        },
        icon: '🎾',
        searchPlaceholder: {
          az: t('dogs.searchPlaceholder'),
          en: t('dogs.searchPlaceholder')
        }
      }}
      filterParams={{
        main_name: 'dog',
        main_category: 'toy'
      }}
      showStockFilter={true}
      customStyles={styles}
    />
  );
};

export default DogToys; 