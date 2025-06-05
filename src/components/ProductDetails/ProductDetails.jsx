import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlices';
import { useReviews } from '../../redux/hooks/useReviews';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import { useTranslation } from 'react-i18next';
import { 
  BsHeart, 
  BsHeartFill, 
  BsArrowLeft, 
  BsStar, 
  BsStarFill, 
  BsShare,
  BsEye,
  BsShieldCheck,
  BsTruck,
  BsGift,
  BsPersonCheck,
  BsCheckCircle,
  BsXCircle,
  BsPlus,
  BsDash,
  BsChatDots
} from 'react-icons/bs';
import { useWishlist } from 'react-use-wishlist';
import { toast } from 'react-hot-toast';
import { useCart } from 'react-use-cart';
import styles from './ProductDetails.module.css';
import { deleteReview } from '../../redux/slices/reviewsSlice';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import ReviewForm from '../ReviewForm/ReviewForm';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state?.user || {});
  const { products = [], loading = false, error } = useSelector((state) => state?.products || {});
  const { addItem } = useCart();
  const { addWishlistItem, removeWishlistItem, inWishlist } = useWishlist();
  const { i18n } = useTranslation();
  const currentLang = i18n?.language;
  const isAzerbaijani = currentLang === 'az';

  // Reviews hook
  const {
    productReviews,
    loading: reviewsLoading,
    error: reviewsError,
    getProductReviews,
    addReview,
    getAverageRating,
    clearProductReviews
  } = useReviews();

  // Helper functions
  const createSlug = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '');
  };

  const extractIdFromSlug = (slug) => {
    if (!slug) return null;
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    const id = parseInt(lastPart);
    return isNaN(id) ? null : id;
  };

  const createFullSlug = (product) => {
    if (!product) return '';
    const name = isAzerbaijani ? (product?.nameAz || product?.nameEn) : (product?.nameEn || product?.nameAz);
    const slug = createSlug(name);
    return slug ? `${slug}-${product.id}` : `product-${product.id}`;
  };
  
  // State
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productFound, setProductFound] = useState(false); // Changed from productNotFound to productFound
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 500) + 50);
  
  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Mock product images (since we only have one image, we'll create variations)
 

  // Fetch products if not already loaded
  useEffect(() => {
    if (products.length === 0 && !loading && !error) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length, loading, error]);

  // Find product by slug
  useEffect(() => {
    // Reset states when slug changes
    setProduct(null);
    setProductFound(false);

    if (!slug) {
      return;
    }

    const productId = extractIdFromSlug(slug);
    if (!productId || productId <= 0) {
      return;
    }

    // Only search for product if products are loaded and no error
    if (!loading && !error && products?.length > 0) {
      const foundProduct = products.find(p => p?.id === productId);
      
      if (foundProduct) {
        const expectedSlug = createFullSlug(foundProduct);
        if (slug === expectedSlug) {
          setProduct(foundProduct);
          setProductFound(true);
        } else {
          const correctSlug = createFullSlug(foundProduct);
          navigate(`/product/${correctSlug}`, { replace: true });
        }
      }
      // If product is not found, we don't set productFound to true, keeping it false
      // This means we will continue showing loading until we're sure the product doesn't exist
    }
  }, [products, slug, navigate, isAzerbaijani, loading, error]);

  // Fetch reviews when product is found
  useEffect(() => {
    if (product?.id) {
      loadProductReviews();
      loadAverageRating();
      // Simulate view count increment
      setViewCount(prev => prev + 1);
    }
    
    return () => {
      clearProductReviews();
    };
  }, [product?.id]);

  const loadProductReviews = async () => {
    if (product?.id) {
      await getProductReviews(product.id);
    }
  };

  const loadAverageRating = async () => {
    if (product?.id) {
      try {
        const result = await getAverageRating(product.id);
        if (result.success) {
          setAverageRating(result.data.averageRating);
          setTotalReviews(result.data.totalReviews);
        }
      } catch (error) {
        console.error('Error loading average rating:', error);
      }
    }
  };

  const getDiscountedPrice = (price, discount) => {
    if (!price || !discount || discount <= 0) return price;
    const discountAmount = price * (discount / 100);
    return Math.max(0, price - discountAmount);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error(t('toast.error.auth.loginRequired'));
      return;
    }

    if (!product) {
      toast.error(t('toast.error.product.notFound'));
      return;
    }

    try {
    const cartItem = {
      id: product.id,
      name: isAzerbaijani ? (product?.nameAz || product?.nameEn || 'Unnamed Product') : (product?.nameEn || product?.nameAz || 'Unnamed Product'),
      price: product?.isDiscount 
        ? getDiscountedPrice(product?.price, product?.discount)
        : (product?.price || 0),
      image: product?.image || '',
      category: isAzerbaijani ? (product?.categoryAz || product?.categoryEn || product?.main_category || 'Uncategorized') : (product?.categoryEn || product?.categoryAz || product?.main_category || 'Uncategorized'),
      originalPrice: product?.price || 0,
      isDiscount: product?.isDiscount || false,
      discount: product?.discount || 0,
      quantity: quantity,
      inStock: product?.inStock !== false
    };

      addItem(cartItem, quantity);
      toast.success(t('toast.success.cart.addSuccess'));
    } catch (error) {
      toast.error(t('toast.error.cart.addError'));
    }
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error(t('toast.error.auth.loginRequired'));
      return;
    }

    if (!product) {
      toast.error(t('toast.error.product.notFound'));
      return;
    }

    try {
      if (inWishlist(product.id)) {
        removeWishlistItem(product.id);
        toast.success(t('toast.success.wishlist.removeSuccess'));
      } else {
        addWishlistItem(product);
        toast.success(t('toast.success.wishlist.addSuccess'));
      }
    } catch (error) {
      toast.error(t('toast.error.wishlist.addError'));
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleGoBack = () => {
    try {
      navigate(-1);
    } catch (error) {
      navigate('/');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isAzerbaijani ? (product?.nameAz || product?.nameEn) : (product?.nameEn || product?.nameAz),
          text: isAzerbaijani ? 'Bu məhsulu yoxlayın!' : 'Check out this product!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('toast.success.link.copied'));
    }
  };

  // Review form handlers
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error(t('toast.error.auth.loginRequired'));
      return;
    }

    if (!reviewComment.trim()) {
      toast.error(t('toast.error.review.commentRequired'));
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      toast.error(t('toast.error.review.ratingInvalid'));
      return;
    }

    setSubmittingReview(true);

    const reviewData = {
      product_id: product.id,
      user_id: user?.id,
      comment: reviewComment.trim(),
      rating: reviewRating
    };

    const result = await addReview(reviewData);
    
    if (result.success) {
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      await loadProductReviews();
      await loadAverageRating();
    }

    setSubmittingReview(false);
  };

  const renderStars = (rating, interactive = false, onStarClick = null, size = 'normal') => {
    const stars = [];
    const sizeClass = size === 'large' ? styles.starLarge : size === 'small' ? styles.starSmall : styles.star;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`${sizeClass} ${interactive ? styles.starInteractive : ''} ${i <= rating ? styles.starFilled : styles.starEmpty}`}
          onClick={interactive && onStarClick ? () => onStarClick(i) : undefined}
          disabled={!interactive}
        >
          {i <= rating ? <BsStarFill /> : <BsStar />}
        </button>
      );
    }
    return <div className={styles.starsContainer}>{stars}</div>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(isAzerbaijani ? 'az-AZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const userHasReviewed = productReviews?.some(review => review.user_id === user?.id);

  // Determine if we should show loading
  const shouldShowLoading = () => {
    // Show loading if:
    // 1. Products are still loading
    // 2. Products loaded successfully but we haven't found our product yet (and no error)
    // 3. Invalid slug or product ID
    if (loading) return true;
    if (error) return false;
    
    const productId = extractIdFromSlug(slug);
    if (!slug || !productId || productId <= 0) return false;
    
    // If products are loaded but we haven't found our product yet
    if (products?.length > 0 && !productFound) return true;
    
    return false;
  };

  // Determine if we should show not found
  const shouldShowNotFound = () => {
    // Show not found only if:
    // 1. We have a valid product ID from slug
    // 2. Products are loaded (not loading and no error)
    // 3. We haven't found the product
    const productId = extractIdFromSlug(slug);
    if (!slug || !productId || productId <= 0) return true;
    if (loading || error) return false;
    if (products?.length > 0 && !productFound) return true;
    return false;
  };

  const handleDeleteReview = (reviewId) => {
    setConfirmDialog({
      isOpen: true,
      title: isAzerbaijani ? 'Rəyi sil' : 'Delete Review',
      message: isAzerbaijani 
        ? 'Bu rəyi silmək istədiyinizə əminsiniz?' 
        : 'Are you sure you want to delete this review?',
      onConfirm: async () => {
        try {
          await dispatch(deleteReview({ reviewId, userId: user?.id })).unwrap();
          await loadProductReviews();
          await loadAverageRating();
          toast.success(t('toast.success.review.deleteSuccess'));
        } catch (error) {
          toast.error(t('toast.error.review.deleteError'));
        }
      }
    });
  };

  // Loading state
  if (shouldShowLoading()) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div className={styles.loadingContent}>
            <div className={styles.loadingText}>
              {isAzerbaijani ? 'Məhsul yüklənir...' : 'Loading product...'}
            </div>
            <div className={styles.loadingSubtext}>
              {isAzerbaijani ? 'Zəhmət olmasa gözləyin' : 'Please wait'}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>
              {isAzerbaijani ? 'Xəta baş verdi' : 'Error Occurred'}
            </h2>
            <p className={styles.errorText}>
              {isAzerbaijani ? 'Məhsul yüklənərkən xəta baş verdi.' : 'An error occurred while loading the product.'}
            </p>
            <button onClick={handleGoBack} className={styles.errorButton}>
              <BsArrowLeft />
              {isAzerbaijani ? 'Geri qayıt' : 'Go Back'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Product not found state - only show when we're certain the product doesn't exist
  if (shouldShowNotFound()) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.notFoundContainer}>
          <div className={styles.notFoundContent}>
            <div className={styles.notFoundIcon}>🔍</div>
            <h2 className={styles.notFoundTitle}>
              {isAzerbaijani ? 'Məhsul tapılmadı' : 'Product Not Found'}
            </h2>
            <p className={styles.notFoundText}>
              {isAzerbaijani ? 'Axtardığınız məhsul mövcud deyil və ya silinmiş ola bilər.' : 'The product you are looking for does not exist or may have been removed.'}
            </p>
            <button onClick={handleGoBack} className={styles.notFoundButton}>
              <BsArrowLeft />
              {isAzerbaijani ? 'Geri qayıt' : 'Go Back'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main product display
  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <div className={styles.mainContainer}>
        {/* Breadcrumb & Back Button */}
        <div className={styles.navigationBar}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <BsArrowLeft />
            <span>{isAzerbaijani ? 'Geri qayıt' : 'Go Back'}</span>
          </button>
          
          <div className={styles.productMeta}>
            <div className={styles.viewCounter}>
              <BsEye />
              <span>{viewCount} {isAzerbaijani ? 'baxış' : 'views'}</span>
            </div>
            <button onClick={handleShare} className={styles.shareButton}>
              <BsShare />
              <span>{isAzerbaijani ? 'Paylaş' : 'Share'}</span>
            </button>
          </div>
        </div>

        <div className={styles.productContainer}>
          {/* Product Images Section */}
          <div className={styles.productImagesSection}>
            {product?.isDiscount && product?.discount > 0 && (
              <div className={styles.discountBadge}>
                <span className={styles.discountText}>
                  -{Math.round(product.discount)}%
                </span>
              </div>
            )}
            
            <div className={styles.mainImageContainer}>
             {product?.image ? (
                <img
  src={product?.image}
  alt={isAzerbaijani ? (product?.nameAz || product?.nameEn) : (product?.nameEn || product?.nameAz)}
  className={styles.modalImage}
/>
              ) : (
               <div className={styles.imagePlaceholder}>
    <span className={styles.placeholderIcon}>📦</span>
  </div>
              )}
              
            </div>
          </div>

          {/* Product Info Section */}
          <div className={styles.productInfoSection}>
            <div className={styles.productHeader}>
              <h1 className={styles.productTitle}>
                {isAzerbaijani 
                  ? (product?.nameAz || product?.nameEn || 'Məhsul adı yoxdur')
                  : (product?.nameEn || product?.nameAz || 'No Product Name')
                }
              </h1>
              
              <div className={styles.productBadges}>
                <span className={styles.categoryBadge}>
                  {isAzerbaijani 
                    ? (product?.categoryAz || product?.categoryEn || product?.main_category || 'Kateqoriya yoxdur')
                    : (product?.categoryEn || product?.categoryAz || product?.main_category || 'No Category')
                  }
                </span>
                {product?.inStock !== false && (
                  <span className={styles.stockBadge}>
                    <BsCheckCircle />
                    {isAzerbaijani ? 'Stokda var' : 'In Stock'}
                  </span>
                )}
              </div>
            </div>

            {/* Rating Display */}
            {totalReviews > 0 && (
              <div className={styles.ratingSection}>
                {renderStars(averageRating, false, null, 'large')}
                <div className={styles.ratingInfo}>
                  <span className={styles.reviewCount}>
                    ({totalReviews} {isAzerbaijani ? 'rəy' : 'reviews'})
                  </span>
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className={styles.priceSection}>
              {product?.isDiscount && product?.discount > 0 ? (
                <div className={styles.discountPricing}>
                  <div className={styles.priceRow}>
                    <span className={styles.currentPrice}>
                      {isAzerbaijani 
                        ? `${getDiscountedPrice(product?.price, product?.discount)?.toFixed(2) || '0.00'} ₼` 
                        : `$${getDiscountedPrice(product?.price, product?.discount)?.toFixed(2) || '0.00'}`}
                    </span>
                    <span className={styles.originalPrice}>
                      {isAzerbaijani ? `${product?.price || 0} ₼` : `$${product?.price || 0}`}
                    </span>
                  </div>
                  <div className={styles.savingsInfo}>
                    <span className={styles.savingsText}>
                      {isAzerbaijani ? 'Qənaət:' : 'You save:'} {isAzerbaijani 
                        ? `${(product?.price - getDiscountedPrice(product?.price, product?.discount))?.toFixed(2)} ₼`
                        : `$${(product?.price - getDiscountedPrice(product?.price, product?.discount))?.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ) : (
                <span className={styles.regularPrice}>
                  {isAzerbaijani ? `${product?.price || 0} ₼` : `$${product?.price || 0}`}
                </span>
              )}
            </div>

            {/* Features Section */}
            <div className={styles.featuresSection}>
              <div className={styles.feature}>
                <BsTruck className={styles.featureIcon} />
                <span>{isAzerbaijani ? 'Pulsuz çatdırılma' : 'Free shipping'}</span>
              </div>
              <div className={styles.feature}>
                <BsShieldCheck className={styles.featureIcon} />
                <span>{isAzerbaijani ? 'Keyfiyyət zəmanəti' : 'Quality guarantee'}</span>
              </div>
              <div className={styles.feature}>
                <BsGift className={styles.featureIcon} />
                <span>{isAzerbaijani ? 'Hədiyyə qablaşdırması' : 'Gift wrapping'}</span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className={styles.purchaseSection}>
              <div className={styles.quantitySelector}>
                <label className={styles.quantityLabel}>
                  {isAzerbaijani ? 'Miqdar:' : 'Quantity:'}
                </label>
                <div className={styles.quantityControls}>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <BsDash />
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 99}
                  >
                    <BsPlus />
                  </button>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button 
                  className={styles.addToCartButton}
                  onClick={handleAddToCart}
                  disabled={!product?.id || !isAuthenticated}
                >
                  <span>{isAzerbaijani ? 'Karta əlavə et' : 'Add to Cart'}</span>
                </button>

                <button
                  className={`${styles.wishlistButton} ${inWishlist(product?.id) ? styles.wishlistActive : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={!product?.id}
                >
                  {inWishlist(product?.id) ? <BsHeartFill /> : <BsHeart />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className={styles.detailsSection}>
          <div className={styles.tabsHeader}>
            <button
              className={`${styles.tabButton} ${activeTab === 'description' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('description')}
            >
              {isAzerbaijani ? 'Təsvir' : 'Description'}
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <BsChatDots />
              {isAzerbaijani ? 'Rəylər' : 'Reviews'}
              {totalReviews > 0 && <span className={styles.tabBadge}>{totalReviews}</span>}
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.descriptionTab}>
                <div className={styles.descriptionContent}>
                  <p className={styles.descriptionText}>
                    {isAzerbaijani 
                      ? (product?.descriptionAz || product?.descriptionEn || 'Təsvir mövcud deyil') 
                      : (product?.descriptionEn || product?.descriptionAz || 'No description available')
                    }
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviewsTab}>
                {/* Review Form */}
                <div className={styles.reviewFormSection}>
                  {isAuthenticated && !userHasReviewed ? (
                    <div className={styles.writeReviewContainer}>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className={styles.writeReviewButton}
                      >
                        <BsPersonCheck />
                        {isAzerbaijani ? 'Rəy yaz' : 'Write Review'}
                      </button>

                      {showReviewForm && (
                        <ReviewForm 
                          onSubmit={async (reviewData) => {
                            const result = await addReview({
                              product_id: product.id,
                              user_id: user?.id,
                              ...reviewData
                            });
                            
                            if (result.success) {
                              setShowReviewForm(false);
                              await loadProductReviews();
                              await loadAverageRating();
                            }
                          }}
                          onCancel={() => setShowReviewForm(false)}
                        />
                      )}
                    </div>
                  ) : isAuthenticated && userHasReviewed ? (
                    <div className={styles.alreadyReviewedMessage}>
                      <BsCheckCircle />
                      <span>{isAzerbaijani ? 'Bu məhsul üçün artıq rəy yazmısınız.' : 'You have already reviewed this product.'}</span>
                    </div>
                  ) : (
                    <div className={styles.loginToReviewMessage}>
                      <BsPersonCheck />
                      <span>{isAzerbaijani ? 'Rəy yazmaq üçün hesabınıza daxil olun.' : 'Please login to write a review.'}</span>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className={styles.reviewsList}>
                  {reviewsLoading ? (
                    <div className={styles.reviewsLoading}>
                      <div className={styles.loadingSpinner}></div>
                      <p>{isAzerbaijani ? 'Rəylər yüklənir...' : 'Loading reviews...'}</p>
                    </div>
                  ) : reviewsError ? (
                    <div className={styles.reviewsError}>
                      <BsXCircle />
                      <p>{isAzerbaijani ? 'Rəyləri yükləməkdə xəta baş verdi.' : 'Error loading reviews.'}</p>
                    </div>
                  ) : productReviews && productReviews.length > 0 ? (
                    productReviews.map((review) => (
                      <div key={review.id} className={`${styles.reviewItem} ${review.user_id === user?.id ? styles.myReview : ''}`}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewerInfo}>
                            <div className={styles.reviewerAvatar}>
                              <BsPersonCheck />
                            </div>
                            <div className={styles.reviewerDetails}>
                              <span className={styles.reviewerName}>
                                {review.users?.username || (isAzerbaijani ? 'Anonim İstifadəçi' : 'Anonymous User')}
                              </span>
                              <div className={styles.reviewRating}>
                                {renderStars(review.rating, false, null, 'small')}
                              </div>
                            </div>
                          </div>
                          <div className={styles.reviewMetadata}>
                            <span className={styles.reviewDate}>
                              {formatDate(review.created_at)}
                            </span>
                            {review.user_id === user?.id && (
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className={styles.deleteReviewButton}
                                title={isAzerbaijani ? 'Rəyi sil' : 'Delete review'}
                              >
                                <BsXCircle />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className={styles.reviewContent}>
                          <p className={styles.reviewComment}>{review.comment}</p>
                        </div>
                        {review.user_id === user?.id && (
                          <div className={styles.reviewActions}>
                            <span className={styles.myReviewBadge}>
                              <BsCheckCircle />
                              {isAzerbaijani ? 'Mənim rəyim' : 'My Review'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noReviews}>
                      <div className={styles.noReviewsIcon}>💬</div>
                      <h3 className={styles.noReviewsTitle}>
                        {isAzerbaijani ? 'Hələ heç bir rəy yoxdur' : 'No reviews yet'}
                      </h3>
                      <p className={styles.noReviewsText}>
                        {isAzerbaijani 
                          ? 'Bu məhsul haqqında ilk rəy yazan siz olun!' 
                          : 'Be the first to share your thoughts about this product!'
                        }
                      </p>
                      {isAuthenticated && !userHasReviewed && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className={styles.firstReviewButton}
                        >
                          {isAzerbaijani ? 'İlk rəy yaz' : 'Write First Review'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className={styles.relatedProductsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {isAzerbaijani ? 'Oxşar məhsullar' : 'Related Products'}
            </h2>
            <div className={styles.sectionDivider}></div>
          </div>
          
          <div className={styles.relatedProductsGrid}>
            {products
              ?.filter(p => 
                p?.id !== product?.id && 
                (p?.main_category === product?.main_category || 
                 p?.categoryEn === product?.categoryEn ||
                 p?.categoryAz === product?.categoryAz)
              )
              .slice(0, 4)
              .map((relatedProduct) => (
                <div key={relatedProduct.id} className={styles.relatedProductCard}>
                  <div className={styles.relatedProductImage}>
                    <img
                      src={relatedProduct.image}
                      alt={isAzerbaijani 
                        ? (relatedProduct?.nameAz || relatedProduct?.nameEn) 
                        : (relatedProduct?.nameEn || relatedProduct?.nameAz)
                      }
                      onClick={() => {
                        const relatedSlug = createFullSlug(relatedProduct);
                        navigate(`/product/${relatedSlug}`);
                      }}
                    />
                    {relatedProduct?.isDiscount && relatedProduct?.discount > 0 && (
                      <div className={styles.relatedDiscountBadge}>
                        -{Math.round(relatedProduct.discount)}%
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.relatedProductInfo}>
                    <h4 className={styles.relatedProductTitle}>
                      {isAzerbaijani 
                        ? (relatedProduct?.nameAz || relatedProduct?.nameEn) 
                        : (relatedProduct?.nameEn || relatedProduct?.nameAz)
                      }
                    </h4>
                    
                    <div className={styles.relatedProductPrice}>
                      {relatedProduct?.isDiscount && relatedProduct?.discount > 0 ? (
                        <>
                          <span className={styles.relatedCurrentPrice}>
                            {isAzerbaijani 
                              ? `${getDiscountedPrice(relatedProduct?.price, relatedProduct?.discount)?.toFixed(2)} ₼` 
                              : `$${getDiscountedPrice(relatedProduct?.price, relatedProduct?.discount)?.toFixed(2)}`}
                          </span>
                          <span className={styles.relatedOriginalPrice}>
                            {isAzerbaijani ? `${relatedProduct?.price} ₼` : `$${relatedProduct?.price}`}
                          </span>
                        </>
                      ) : (
                        <span className={styles.relatedRegularPrice}>
                          {isAzerbaijani ? `${relatedProduct?.price} ₼` : `$${relatedProduct?.price}`}
                        </span>
                      )}
                    </div>
                    
                    <button
                      className={styles.relatedProductButton}
                      onClick={() => {
                        const relatedSlug = createFullSlug(relatedProduct);
                        navigate(`/product/${relatedSlug}`);
                      }}
                    >
                      {isAzerbaijani ? 'Bax' : 'View'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className={styles.imageModal} onClick={() => setShowImageModal(false)}>
          <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeModalButton}
              onClick={() => setShowImageModal(false)}
            >
              <BsXCircle />
            </button>
            
            <div className={styles.modalImageContainer}>
              <img
  src={product?.image}
  alt={isAzerbaijani ? (product?.nameAz || product?.nameEn) : (product?.nameEn || product?.nameAz)}
  className={styles.mainImage}
  onClick={() => setShowImageModal(true)}
/>
              
             {productImages.length > 1 && (
  <>
    <button
      className={`${styles.modalNavButton} ${styles.modalPrevButton}`}
      onClick={() => setSelectedImageIndex(prev => 
        prev > 0 ? prev - 1 : productImages.length - 1
      )}
    >
      <BsChevronLeft />
    </button>
    
    <button
      className={`${styles.modalNavButton} ${styles.modalNextButton}`}
      onClick={() => setSelectedImageIndex(prev => 
        prev < productImages.length - 1 ? prev + 1 : 0
      )}
    >
      <BsChevronRight />
    </button>
  </>
)}

{productImages.length > 1 && (
  <div className={styles.modalThumbnails}>
    {productImages.map((image, index) => (
      <button
        key={index}
        className={`${styles.modalThumbnail} ${selectedImageIndex === index ? styles.activeModalThumbnail : ''}`}
        onClick={() => setSelectedImageIndex(index)}
      >
        <img src={image} alt={`View ${index + 1}`} />
      </button>
    ))}
  </div>
)}
            </div>
            
            {productImages.length > 1 && (
              <div className={styles.modalThumbnails}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    className={`${styles.modalThumbnail} ${selectedImageIndex === index ? styles.activeModalThumbnail : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`View ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />

      <Footer />
    </div>
  );
};

export default ProductDetails;