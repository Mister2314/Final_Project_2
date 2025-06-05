import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlices';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import LoadingScreen from '../../components/Loading/LoadingScreen';
import styles from './Cats.module.css';

const Cats = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { category } = useParams();
  const { products, loading, error } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  const categories = [
    { id: 'all', name: 'Bütün Məhsullar', icon: '🐱', route: '/shop/cats/all-products' },
    { id: 'food', name: 'Pişik Yemləri', icon: '🍽️', route: '/shop/cats/foods'},
    { id: 'litter', name: 'Pişik Qumları', icon: '🏠', route: '/shop/cats/litter' },
    { id: 'beds', name: 'Ev və Yataqlar', icon: '🛏️', route: '/shop/cats/beds-and-home' },
    { id: 'carriers', name: 'Daşıma Çantaları', icon: '👜', route: '/shop/cats/carriers' },
    { id: 'leashes', name: 'Qayışlar', icon: '🐈', route: '/shop/cats/leashes' }
  ];

  useEffect(() => {
    if (category) {
      if (category === 'all-products') {
        return;
      }
      
      const validCategory = categories.find(cat => 
        cat.route === `/shop/cats/${category}` || 
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
      
      let filters = {};
      
      if (selectedCat?.filter) {
        filters = selectedCat.filter;
      } else {
        filters = { 
          main_category: 'cats',
          sub_category: selectedCategory 
        };
      }
      
      dispatch(fetchProducts(filters));
    }
  }, [dispatch, selectedCategory]);

  const handleCategorySelect = (categoryId) => {
    const selectedCat = categories.find(cat => cat.id === categoryId);
    
    if (selectedCat) {
      navigate(selectedCat.route);
      setSelectedCategory(categoryId);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.catsPageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.catIcon}>🐱</span>
              Pişiklər üçün Məhsullar
            </h1>
            <p className={styles.heroSubtitle}>
              Sevimli pişikləriniz üçün keyfiyyətli və təhlükəsiz məhsullar
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

    </div>
  );
};

export default Cats;