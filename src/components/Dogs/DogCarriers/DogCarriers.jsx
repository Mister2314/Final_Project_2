import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogCarriers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'carrier'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      title="İt Daşıma Çantaları"
      titleEn="Dog Carriers"
      description="İtiniz üçün rahat və təhlükəsiz daşıma çantaları"
      descriptionEn="Comfortable and safe carriers for your dog"
      icon="👜"
      filterParams={{
        main_name: 'dog',
        main_category: 'carrier'
      }}
      showStockFilter={true}
      pageConfig={{
        title: {
          az: 'İt Daşıma Çantaları',
          en: 'Dog Carriers'
        },
        subtitle: {
          az: 'İtiniz üçün rahat və təhlükəsiz daşıma çantaları',
          en: 'Comfortable and safe carriers for your dog'
        },
        icon: '👜',
        searchPlaceholder: {
          az: 'Çanta axtar...',
          en: 'Search carriers...'
        }
      }}
      customStyles={styles}
    />
  );
};

export default DogCarriers; 