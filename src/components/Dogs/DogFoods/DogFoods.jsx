import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogFoods = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'food'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      title="İt Yemləri"
      titleEn="Dog Foods"
      description="İtiniz üçün keyfiyyətli və sağlam qidalar"
      descriptionEn="Quality and healthy food for your dog"
      icon="🍖"
      filterParams={{
        main_name: 'dog',
        main_category: 'food'
      }}
      showStockFilter={true}
      pageConfig={{
        title: {
          az: 'İt Yemləri',
          en: 'Dog Foods'
        },
        subtitle: {
          az: 'İtiniz üçün keyfiyyətli və sağlam qidalar',
          en: 'Quality and healthy food for your dog'
        },
        icon: '🍖',
        searchPlaceholder: {
          az: 'Yem axtar...',
          en: 'Search food...'
        }
      }}
      customStyles={styles}
    />
  );
};

export default DogFoods; 