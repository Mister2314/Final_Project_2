import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlices';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import styles from './Dogs.module.css';

const Dogs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { category } = useParams();
  const { products } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  const categories = [
    { id: 'all', name: 'Bütün Məhsullar', icon: '🐕', route: '/shop/dogs/all-products' },
    { id: 'food', name: 'İt Yemləri', icon: '🍖', route: '/shop/dogs/foods' },
    { id: 'toys', name: 'Oyuncaqlar', icon: '🎾', route: '/shop/dogs/toys' },
    { id: 'beds', name: 'Ev və Yataqlar', icon: '🏠', route: '/shop/dogs/beds-and-home' },
    { id: 'carriers', name: 'Daşıma Çantaları', icon: '👜', route: '/shop/dogs/carriers' },
    { id: 'leashes', name: 'Qayışlar və Boyunduruqlar', icon: '🦮', route: '/shop/dogs/leashes' }
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
              İtlər üçün Məhsullar
            </h1>
            <p className={styles.heroSubtitle}>
              Sevimli itləriniz üçün keyfiyyətli və təhlükəsiz məhsullar
            </p>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.categoriesSection}>
            <h2 className={styles.sectionTitle}>Kateqoriyalar</h2>
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
                    {selectedCategory === category.id && products.length > 0 
                      ? `${products.length} məhsul` 
                      : 'Seçin'
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