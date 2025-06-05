import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlices';
import ProductsTemplate from '../../ProductsTemplate/ProductsTemplate';
import styles from '../Dogs.module.css';

const DogToys = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const filters = {
      main_name: 'dog',
      main_category: 'toy'
    };
    dispatch(fetchProducts(filters));
  }, [dispatch]);

  return (
    <ProductsTemplate
      title="İt Oyuncaqları"
      titleEn="Dog Toys"
      description="İtiniz üçün əyləncəli və təhlükəsiz oyuncaqlar"
      descriptionEn="Fun and safe toys for your dog"
      icon="🎾"
      filterParams={{
        main_name: 'dog',
        main_category: 'toy'
      }}
      showStockFilter={true}
      pageConfig={{
        title: {
          az: 'İt Oyuncaqları',
          en: 'Dog Toys'
        },
        subtitle: {
          az: 'İtiniz üçün əyləncəli və təhlükəsiz oyuncaqlar',
          en: 'Fun and safe toys for your dog'
        },
        icon: '🎾',
        searchPlaceholder: {
          az: 'Oyuncaq axtar...',
          en: 'Search toys...'
        }
      }}
      customStyles={styles}
    />
  );
};

export default DogToys; 