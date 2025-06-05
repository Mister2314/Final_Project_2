import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchProducts } from '../../redux/slices/productSlices';
import styles from './FeaturedProducts.module.css';

const FeaturedProducts = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAzerbaijani = i18n.language === 'az';

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get random featured products
  const featuredProducts = useMemo(() => {
    const eligibleProducts = products.filter(product => product.isDiscount || product.isFeatured);
    const shuffled = [...eligibleProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4); // Show 4 random products
  }, [products]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading && products.length === 0) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.icon}>⭐</span>
              {isAzerbaijani ? 'Seçilmiş Məhsullar' : 'Featured Products'}
            </h2>
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0 || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.icon}>⭐</span>
            {isAzerbaijani ? 'Seçilmiş Məhsullar' : 'Featured Products'}
          </h2>
          <p className={styles.sectionSubtitle}>
            {isAzerbaijani 
              ? 'Heyvanlarınız üçün ən yaxşı məhsullar'
              : 'Best products for your pets'}
          </p>
        </div>

        <div className={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              className={styles.productCard}
              onClick={() => handleProductClick(product.id)}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={product.image} 
                  alt={isAzerbaijani ? product.nameAz : product.nameEn}
                  className={styles.productImage}
                />
                {product.isDiscount && (
                  <div className={styles.discountBadge}>
                    -{product.discount}%
                  </div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>
                  {isAzerbaijani ? product.nameAz : product.nameEn}
                </h3>
                <div className={styles.productMeta}>
                  <span className={styles.category}>
                    {isAzerbaijani ? product.categoryAz : product.categoryEn}
                  </span>
                  <div className={styles.price}>
                    {product.isDiscount ? (
                      <>
                        <span className={styles.originalPrice}>
                          {product.price}₼
                        </span>
                        <span className={styles.discountedPrice}>
                          {(product.price * (1 - product.discount / 100)).toFixed(2)}₼
                        </span>
                      </>
                    ) : (
                      <span className={styles.regularPrice}>
                        {product.price}₼
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className={styles.viewAllButton}
          onClick={() => navigate('/shop')}
        >
          {isAzerbaijani ? 'Bütün Məhsulları Gör' : 'View All Products'}
          <span className={styles.buttonIcon}>→</span>
        </button>
      </div>
    </section>
  );
};

export default FeaturedProducts; 