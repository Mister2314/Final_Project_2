import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogLeashes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'leash'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      title="İt Qayışları və Boyunduruqları"
      titleEn="Dog Leashes and Collars"
      description="İtiniz üçün rahat və davamlı qayışlar"
      descriptionEn="Comfortable and durable leashes for your dog"
      icon="🦮"
      filterParams={{
        main_name: 'dog',
        main_category: 'leash'
      }}
      showStockFilter={true}
      pageConfig={{
        title: {
          az: 'İt Qayışları və Boyunduruqları',
          en: 'Dog Leashes and Collars'
        },
        subtitle: {
          az: 'İtiniz üçün rahat və davamlı qayışlar',
          en: 'Comfortable and durable leashes for your dog'
        },
        icon: '🦮',
        searchPlaceholder: {
          az: 'Qayış axtar...',
          en: 'Search leashes...'
        }
      }}
      customStyles={styles}
    />
  );
};

export default DogLeashes; 