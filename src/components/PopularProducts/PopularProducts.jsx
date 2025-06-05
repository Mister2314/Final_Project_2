import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from 'react-use-cart';
import { useWishlist } from 'react-use-wishlist';
import { toast } from 'react-hot-toast';
import { BsHeart, BsHeartFill, BsArrowRight } from 'react-icons/bs';
import { getAllOrders } from '../../redux/slices/ordersSlice';
import { fetchProducts } from '../../redux/slices/productSlices';
import styles from './PopularProducts.module.css';

const PopularProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { addWishlistItem, removeWishlistItem, inWishlist } = useWishlist();
  const { isAuthenticated } = useSelector((state) => state.user);
  
  const { orders } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);
  const [popularProducts, setPopularProducts] = useState([]);
  
  const isAzerbaijani = i18n.language === 'az';

  useEffect(() => {
    dispatch(getAllOrders());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (orders.length > 0 && products.length > 0) {
      const productSales = new Map();
      orders.forEach(order => {
        order.products?.forEach(product => {
          const currentCount = productSales.get(product.id) || 0;
          productSales.set(product.id, currentCount + (product.quantity || 1));
        });
      });

      const sortedProducts = Array.from(productSales.entries())
        .sort(([, a], [, b]) => b - a) 
        .slice(0, 8) 
        .map(([productId]) => {
          return products.find(p => p.id === productId);
        })
        .filter(Boolean); 

      setPopularProducts(sortedProducts);
    }
  }, [orders, products]);

  const getDiscountedPrice = (price, discount) => {
    if (!price || !discount) return price;
    return price - (price * discount / 100);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error(t('popularProducts.loginRequired'));
      return;
    }

    const itemToAdd = {
      id: product.id,
      name: isAzerbaijani ? product.nameAz : product.nameEn,
      price: product.isDiscount 
        ? getDiscountedPrice(product.price, product.discount)
        : product.price,
      image: product.image
    };

    try {
      addItem(itemToAdd);
      toast.success(t('popularProducts.addToCartSuccess'));
    } catch (error) {
      toast.error(t('popularProducts.addToCartError'));
    }
  };

  const handleWishlistToggle = (product) => {
    if (!isAuthenticated) {
      toast.error(t('popularProducts.loginRequired'));
      return;
    }

    try {
      if (inWishlist(product.id)) {
        removeWishlistItem(product.id);
        toast.success(t('popularProducts.removeFromWishlistSuccess'));
      } else {
        addWishlistItem(product);
        toast.success(t('popularProducts.addToWishlistSuccess'));
      }
    } catch (error) {
      toast.error(t('popularProducts.wishlistError'));
    }
  };

  const handleProductClick = (product) => {
    const name = isAzerbaijani ? (product.nameAz || product.nameEn) : (product.nameEn || product.nameAz);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    navigate(`/product/${slug}-${product.id}`);
  };

  if (popularProducts.length === 0) {
    return null;
  }

  return (
    <section className={styles.popularProducts}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>
          {t('popularProducts.title')}
        </h2>
        <p className={styles.subtitle}>
          {t('popularProducts.subtitle')}
        </p>
      </div>

      <div className={styles.productsGrid}>
        {popularProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div 
              className={styles.imageContainer}
              onClick={() => handleProductClick(product)}
            >
              <img 
                src={product.image} 
                alt={isAzerbaijani ? product.nameAz : product.nameEn}
                className={styles.productImage}
              />
              {product.isDiscount && product.discount > 0 && (
                <span className={styles.discountBadge}>
                  -{Math.round(product.discount)}%
                </span>
              )}
            </div>

            <div className={styles.productInfo}>
              <h3 
                className={styles.productName}
                onClick={() => handleProductClick(product)}
              >
                {isAzerbaijani ? product.nameAz : product.nameEn}
              </h3>

              <div className={styles.priceContainer}>
                {product.isDiscount && product.discount > 0 ? (
                  <>
                    <span className={styles.discountedPrice}>
                      {isAzerbaijani ? `${getDiscountedPrice(product.price, product.discount)} ₼` 
                        : `$${getDiscountedPrice(product.price, product.discount)}`}
                    </span>
                    <span className={styles.originalPrice}>
                      {isAzerbaijani ? `${product.price} ₼` : `$${product.price}`}
                    </span>
                  </>
                ) : (
                  <span className={styles.price}>
                    {isAzerbaijani ? `${product.price} ₼` : `$${product.price}`}
                  </span>
                )}
              </div>

              <div className={styles.actions}>
                <button 
                  className={styles.addToCartButton}
                  onClick={() => handleAddToCart(product)}
                >
                  {t('popularProducts.addToCart')}
                </button>
                <button
                  className={`${styles.wishlistButton} ${inWishlist(product.id) ? styles.active : ''}`}
                  onClick={() => handleWishlistToggle(product)}
                >
                  {inWishlist(product.id) ? <BsHeartFill /> : <BsHeart />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.viewAllContainer}>
        <button 
          className={styles.viewAllButton}
          onClick={() => navigate('/shop')}
        >
          {t('popularProducts.viewAllProducts')}
          <BsArrowRight />
        </button>
      </div>
    </section>
  );
};

export default PopularProducts;