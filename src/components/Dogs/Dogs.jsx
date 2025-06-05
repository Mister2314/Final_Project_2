import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../redux/slices/productSlices';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import styles from './Dogs.module.css';

const Dogs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { category } = useParams();
  const { products } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  const categories = [
    { id: 'all', name: t('dogs.categories.all'), icon: '🐕', route: '/shop/dogs/all-products' },
    { id: 'food', name: t('dogs.categories.food'), icon: '🍖', route: '/shop/dogs/foods' },
    { id: 'toys', name: t('dogs.categories.toys'), icon: '🎾', route: '/shop/dogs/toys' },
    { id: 'beds', name: t('dogs.categories.beds'), icon: '🏠', route: '/shop/dogs/beds-and-home' },
    { id: 'carriers', name: t('dogs.categories.carriers'), icon: '👜', route: '/shop/dogs/carriers' },
    { id: 'leashes', name: t('dogs.categories.leashes'), icon: '🦮', route: '/shop/dogs/leashes' }
  ];

  useEffect(() => {
    if (category) {
      if (category === 'all-products') {
        return;
      }
      
      const validCategory = categories.find(cat => 
        cat.route === `/shop/dogs/${category}` || 
        (category === 'foods' && cat.id === 'food')
      );
      
      if (validCategory) {
        setSelectedCategory(validCategory.id);
      }
    }
  }, [category]);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      const selectedCat = categories.find(cat => cat.id === selectedCategory);
      
      let filters = {
        main_name: 'dog'
      };
      
      if (selectedCat?.filter) {
        filters = { ...filters, ...selectedCat.filter };
      } else {
        filters.main_category = selectedCategory;
      }
      
      dispatch(fetchProducts(filters));
    } else if (selectedCategory === 'all' || !selectedCategory) {
      dispatch(fetchProducts({ main_name: 'dog' }));
    }
  }, [dispatch, selectedCategory]);

  const handleCategorySelect = (categoryId) => {
    const selectedCat = categories.find(cat => cat.id === categoryId);
    
    if (selectedCat) {
      navigate(selectedCat.route);
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className={styles.dogsPageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.dogIcon}>🐕</span>
              {t('dogs.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('dogs.subtitle')}
            </p>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>{t('dogs.categories.title')}</h2>
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`${styles.categoryCard} ${
                    selectedCategory === category.id ? styles.active : ''
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <div className={styles.categoryBadge}>
                    {selectedCategory === category.id 
                      ? t('dogs.categoryBadge.selected')
                      : t('dogs.categoryBadge.select')
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dogs;