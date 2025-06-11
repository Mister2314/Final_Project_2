import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useCart } from 'react-use-cart';
import { useWishlist } from 'react-use-wishlist';
import { BsHeart, BsHeartFill, BsShieldCheck, BsTruck, BsArrowReturnLeft, BsCheckCircle } from 'react-icons/bs';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import styles from './ProductDetail.module.css';
import { errorToast, successToast } from '../../utils/toast';
import { deleteReview } from '../../features/reviews/reviewsSlice';
import Spinner from '../../components/Spinner/Spinner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { addWishlistItem, removeWishlistItem, inWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const { products, loading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.user);
  const currentLang = i18n.language;
  const isAzerbaijani = currentLang === 'az';

  const product = products.find(p => p.id === parseInt(id));

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
    }
  }, [product]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>{t('productDetail.productNotFound')}</h2>
        <button 
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          {t('productDetail.goBack')}
        </button>
      </div>
    );
  }

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + value));
    setQuantity(newQuantity);
  };

  const getDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setConfirmDialog({
        isOpen: true,
        title: t('productDetail.loginRequired'),
        message: t('productDetail.loginMessage'),
        onConfirm: () => {
          navigate('/login');
        },
      });
      return;
    }
    
    if (!product.instock) {
      errorToast(t('productDetail.outOfStock'));
      return;
    }
    
    const cartItem = {
      id: product.id,
      name: isAzerbaijani ? product.nameAz : product.nameEn,
      price: product.isDiscount 
        ? getDiscountedPrice(product.price, product.discount)
        : product.price,
      image: product.image,
      category: isAzerbaijani ? product.categoryAz : product.categoryEn,
      originalPrice: product.price,
      isDiscount: product.isDiscount,
      discount: product.discount || 0,
      quantity: quantity,
      inStock: product.instock
    };
    
    try {
      addItem(cartItem);
      successToast(t('productDetail.addedToCart'));
    } catch (error) {
      errorToast(t('productDetail.errorOccurred'));
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      errorToast(t('productDetail.pleaseLoginFirst'));
      return;
    }
    
    if (inWishlist(product.id)) {
      removeWishlistItem(product.id);
      successToast(t('productDetail.removedFromWishlist'));
    } else {
      addWishlistItem(product);
      successToast(t('productDetail.addedToWishlist'));
    }
  };

  const productImages = [product.image, ...(product.additionalImages || [])].filter(Boolean);

  const handleCloseDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteReview = async (reviewId) => {
        try {
      await dispatch(deleteReview(reviewId));
      toast.success(t('toast.success.review.deleteSuccess'));
        } catch (error) {
      toast.error(t('toast.error.review.deleteError'));
      }
  };

  return (
    <div className={styles.productDetailContainer}>
      <Header />
      
      <div className={styles.productContent}>
        <div className={`${styles.productGrid} ${product?.isDiscount ? styles.hasDiscount : ''}`}>
          <div className={styles.imageGallery}>
            {product?.isDiscount && product?.discount > 0 && (
              <div className={styles.discountBadge}>
                -{Math.round(product.discount)}%
              </div>
            )}
            
            <div className={styles.mainImageContainer}>
              {product?.image ? (
                <img
                  src={product?.image}
                  alt={isAzerbaijani ? (product?.nameAz || product?.nameEn) : (product?.nameEn || product?.nameAz)}
                  className={styles.mainImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span className={styles.placeholderIcon}>📦</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.productInfoSection}>
            <div className={styles.productHeader}>
              <h1 className={styles.productTitle}>
                {isAzerbaijani 
                  ? (product?.nameAz || product?.nameEn || t('productDetail.noProductName'))
                  : (product?.nameEn || product?.nameAz || t('productDetail.noProductName'))
                }
              </h1>
              
              <div className={styles.productBadges}>
                <span className={styles.categoryBadge}>
                  {isAzerbaijani 
                    ? (product?.categoryAz || product?.categoryEn || product?.main_category || t('productDetail.noCategory'))
                    : (product?.categoryEn || product?.categoryAz || product?.main_category || t('productDetail.noCategory'))
                  }
                </span>
                {product?.instock !== false && (
                  <span className={styles.stockBadge}>
                    <BsCheckCircle />
                    {t('productDetail.inStock')}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.priceSection}>
              {product?.isDiscount && product?.discount > 0 ? (
                <>
                  <div className={styles.discountInfo}>
                    <div className={styles.discountAmount}>
                      -{Math.round(product.discount)}%
                      <span className={styles.discountLabel}>
                        {t('productDetail.discount')}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.priceContainer}>
                    <div className={styles.priceRow}>
                      <span className={styles.discountedPrice}>
                        {getDiscountedPrice(product?.price, product?.discount)?.toFixed(2)}
                        <span className={styles.currencySymbol}>₼</span>
                      </span>
                      <span className={styles.originalPrice}>
                        {product?.price}₼
                      </span>
                      <span className={styles.savingsTag}>
                        {t('productDetail.save')} 
                        {(product?.price - getDiscountedPrice(product?.price, product?.discount))?.toFixed(2)}₼
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <span className={styles.regularPrice}>
                  {product?.price || 0}
                  <span className={styles.currencySymbol}>₼</span>
                </span>
              )}
            </div>

            <p className={styles.productDescription}>
              {isAzerbaijani ? product.descriptionAz : product.descriptionEn}
            </p>

            <div className={styles.actionButtons}>
              <div className={styles.quantityControl}>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <span className={styles.quantity}>{quantity}</span>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                >
                  <FiPlus />
                </button>
              </div>

              <button
                className={`${styles.addToCartBtn} ${!product.instock ? styles.disabled : ''}`}
                onClick={handleAddToCart}
                disabled={!product.instock}
              >
                🛒 {t('productDetail.addToCart')}
              </button>

              <button
                className={`${styles.buyNowBtn} ${!product.instock ? styles.disabled : ''}`}
                onClick={handleBuyNow}
                disabled={!product.instock}
              >
                💳 {t('productDetail.buyNow')}
              </button>
            </div>

            <div className={styles.productMeta}>
              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>
                  <BsShieldCheck />
                </div>
                <div className={styles.metaContent}>
                  <h4 className={styles.metaTitle}>
                    {t('productDetail.guarantee')}
                  </h4>
                  <p className={styles.metaText}>
                    {t('productDetail.guaranteeText')}
                  </p>
                </div>
              </div>

              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>
                  <BsTruck />
                </div>
                <div className={styles.metaContent}>
                  <h4 className={styles.metaTitle}>
                    {t('productDetail.delivery')}
                  </h4>
                  <p className={styles.metaText}>
                    {t('productDetail.deliveryText')}
                  </p>
                </div>
              </div>

              <div className={styles.metaItem}>
                <div className={styles.metaIcon}>
                  <BsArrowReturnLeft />
                </div>
                <div className={styles.metaContent}>
                  <h4 className={styles.metaTitle}>
                    {t('productDetail.returnPolicy')}
                  </h4>
                  <p className={styles.metaText}>
                    {t('productDetail.returnPolicyText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

export default ProductDetail;