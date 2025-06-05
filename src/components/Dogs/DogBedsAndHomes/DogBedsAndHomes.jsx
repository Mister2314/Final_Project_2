import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogBedsAndHomes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'bed'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      title="İt Yataqları və Evləri"
      titleEn="Dog Beds and Homes"
      description="Sevimli itiniz üçün rahat yataq və evlər"
      descriptionEn="Comfortable beds and homes for your beloved dog"
      icon="🏠"
      filterParams={{
        main_name: 'dog',
        main_category: 'bed'
      }}
      showStockFilter={true}
      pageConfig={{
        title: {
          az: 'İt Yataqları və Evləri',
          en: 'Dog Beds and Homes'
        },
        subtitle: {
          az: 'Sevimli itiniz üçün rahat yataq və evlər',
          en: 'Comfortable beds and homes for your beloved dog'
        },
        icon: '🏠',
        searchPlaceholder: {
          az: 'Yataq və ev axtar...',
          en: 'Search beds and homes...'
        }
      }}
      customStyles={styles}
    />
  );
};

export default DogBedsAndHomes; 