import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './OrderCompleted.module.css';
import { fetchProducts } from '../../redux/slices/productSlices';
import { clearCurrentOrder } from '../../redux/slices/ordersSlice';

const OrderCompleted = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const isAzerbaijani = i18n.language === 'az';
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { currentOrder } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Update random products whenever the component mounts or products change
  useEffect(() => {
    if (products.length > 0) {
      updateRandomProducts();
    }
  }, [products]);

  const updateRandomProducts = () => {
    const validProducts = products.filter(p => p.image && p.nameAz && p.nameEn && p.price);
    const shuffled = [...validProducts].sort(() => 0.5 - Math.random());
    setRelatedProducts(shuffled.slice(0, 4));
  };

  // Clear current order when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const successIconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const getDiscountedPrice = (price, discount) => {
    if (!price || !discount || discount <= 0) return price;
    const discountAmount = price * (discount / 100);
    return Math.max(0, price - discountAmount);
  };

  const createSlug = (product) => {
    if (!product) return '';
    const name = isAzerbaijani ? (product.nameAz || product.nameEn) : (product.nameEn || product.nameAz);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `${slug}-${product.id}`;
  };

  return (
    <motion.div 
      className={styles.orderCompletedContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={styles.successIcon}
        variants={successIconVariants}
      >
        ✓
      </motion.div>

      <motion.h1 
        className={styles.title}
        variants={itemVariants}
      >
        {isAzerbaijani ? 'Sifarişiniz uğurla yaradıldı!' : 'Order Successfully Created!'}
      </motion.h1>

      <div className={styles.buttonGroup}>
        <motion.button
          className={styles.viewOrdersButton}
          onClick={handleViewOrders}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAzerbaijani ? 'Sifarişlərimə keç' : 'View My Orders'}
        </motion.button>

        <motion.button
          className={styles.continueShoppingButton}
          onClick={handleContinueShopping}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAzerbaijani ? 'Alış-verişə davam et' : 'Continue Shopping'}
        </motion.button>
      </div>

      {relatedProducts.length > 0 && (
        <motion.div 
          className={styles.relatedProductsSection}
          variants={itemVariants}
        >
          <h2 className={styles.relatedTitle}>
            {isAzerbaijani ? 'Bəyənə biləcəyiniz məhsullar' : 'You might also like'}
          </h2>
          <div className={styles.relatedProductsGrid}>
            {relatedProducts.map((product) => (
              <motion.div
                key={product.id}
                className={styles.productCard}
                onClick={() => navigate(`/product/${createSlug(product)}`)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.productImageContainer}>
                  {product.isDiscount && product.discount > 0 && (
                    <div className={styles.discountBadge}>
                      -{Math.round(product.discount)}%
                    </div>
                  )}
                  <img 
                    src={product.image} 
                    alt={isAzerbaijani ? (product.nameAz || product.nameEn) : (product.nameEn || product.nameAz)}
                    className={styles.productImage}
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>
                    {isAzerbaijani ? (product.nameAz || product.nameEn) : (product.nameEn || product.nameAz)}
                  </h3>
                  <div className={styles.priceContainer}>
                    {product.isDiscount && product.discount > 0 ? (
                      <>
                        <span className={styles.discountedPrice}>
                          ₼{getDiscountedPrice(product.price, product.discount).toFixed(2)}
                        </span>
                        <span className={styles.originalPrice}>
                          ₼{parseFloat(product.price).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className={styles.price}>
                        ₼{parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderCompleted;