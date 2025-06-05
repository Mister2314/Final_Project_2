import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import { IoBagHandleOutline } from 'react-icons/io5';
import { BsHeart, BsHeartFill } from 'react-icons/bs'; 
import styles from './Cart.module.css';
import { useWishlist } from 'react-use-wishlist';
import { useCart } from 'react-use-cart';
import { clearError } from '../../redux/slices/ordersSlice';
import { errorToast, successToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { 
    addWishlistItem, 
    items: wishlistItems, 
    inWishlist 
  } = useWishlist();
  const [loading, setLoading] = useState(false);
  
  const { loading: orderLoading, error: orderError } = useSelector(state => state.orders);
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  const {
    items: cartItems,
    isEmpty,
    cartTotal,
    removeItem,
    updateItemQuantity,
    emptyCart
  } = useCart();

  React.useEffect(() => {
    if (orderError) {
      dispatch(clearError());
    }
  }, []);

  const getCategoryDisplayName = (item) => {
    if (item.main_name) {
      return t(`common.${item.main_name === 'cat' ? 'cats' : 'dogs'}`);
    }
  };

  const isInWishlist = (itemId) => {
    return inWishlist(itemId);
  };

  const hasInvalidItems = () => {
    return cartItems.some(item => 
      !item.name || 
      !item.price || 
      item.price <= 0 || 
      !item.quantity || 
      item.quantity <= 0 ||
      item.inStock === false
    );
  };

  const addToWishlist = (item) => {
    try {
      if (!isAuthenticated) {
        errorToast('toast.error.auth.loginRequired');
        return;
      }

      if (isInWishlist(item.id)) {
        errorToast('toast.error.wishlist.alreadyExists');
        return;
      }

      const name = item.nameAz || item.nameEn || item.name;
      if (!item.id || !name || !item.price || item.price <= 0) {
        errorToast('toast.error.wishlist.invalidProduct');
        return;
      }

      const wishlistItem = {
        id: item.id,
        name: name,
        nameAz: item.nameAz || name,
        nameEn: item.nameEn || name,
        price: item.originalPrice || item.price,
        image: item.image,
        category: item.category,
        main_name: item.main_name,
        main_category: item.main_category,
        categoryAz: item.categoryAz || getCategoryDisplayName(item),
        categoryEn: item.categoryEn || (item.main_name === 'cat' ? 'Cats' : 'Dogs'),
        isDiscount: item.isDiscount || false,
        discount: item.discount || 0,
        originalPrice: item.originalPrice || item.price,
        instock: item.inStock !== false
      };

      addWishlistItem(wishlistItem);
      removeItem(item.id);
      successToast('toast.success.wishlist.addSuccess');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      errorToast('toast.error.wishlist.addError');
    }
  };

  const updateQuantity = (id, newQuantity) => {
    try {
      if (newQuantity < 1) {
        errorToast('toast.error.cart.quantity.invalid');
        return;
      }

      updateItemQuantity(id, newQuantity);
      successToast('toast.success.cart.updateSuccess');

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemIndex = existingCart.findIndex(item => item.id === id);
      
      if (itemIndex > -1) {
        existingCart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(existingCart));
      }
    } catch (error) {
      errorToast('toast.error.cart.updateError');
    }
  };

  const handleRemoveItem = (id) => {
    try {
      removeItem(id);
      successToast('toast.success.cart.removeSuccess');

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = existingCart.filter(item => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      errorToast('toast.error.cart.removeError');
    }
  };

  const calculateSubtotal = () => {
    return cartTotal;
  };

  const calculateTotal = () => {
    const subtotal = cartTotal;
    const shipping = subtotal > 50 ? 0 : 9.99;
    return subtotal + shipping;
  };

  const handleCheckout = async () => {
    if (orderError) {
      dispatch(clearError());
    }

    if (isEmpty) {
      errorToast('toast.error.cart.empty');
      return;
    }

    if (!isAuthenticated || !user) {
      errorToast('toast.error.auth.loginRequired');
      navigate('/login');
      return;
    }

    const invalidProducts = cartItems.filter(item => 
      !item.name || 
      !item.price || 
      item.price <= 0 || 
      !item.quantity || 
      item.quantity <= 0 ||
      item.inStock === false
    );

    if (invalidProducts.length > 0) {
      errorToast('toast.error.cart.invalidProducts');
      return;
    }

    if (!user.id) {
      errorToast('toast.error.auth.userNotFound');
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = calculateTotal();

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FaArrowLeft />
          <span>{t('buttons.back')}</span>
        </button>
        <h1 className={styles.cartTitle}>
          <IoBagHandleOutline className={styles.titleIcon} />
          {t('user.cart')} ({cartItems.length})
        </h1>
      </div>

      {isEmpty ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <FaShoppingBag />
          </div>
          <h2>{t('cart.empty.title')}</h2>
          <p>{t('cart.empty.description')}</p>
          <button 
            onClick={() => navigate('/shop')}
            className={styles.shopButton}
          >
            {t('cart.empty.shopButton')}
          </button>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cartItems.map(item => (
              <div key={item.id} className={`${styles.cartItem} ${
                (!item.name || !item.price || item.price <= 0) ? styles.invalidItem : ''
              }`}>
                <div className={styles.itemImage}>
                  <img src={item.image} alt={item.name} />
                  {(!item.name || !item.price || item.price <= 0) && (
                    <div className={styles.invalidBadge}>⚠️</div>
                  )}
                </div>
                
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>
                    {item.name || t('common.noProductName')}
                  </h3>
                  <div className={styles.itemPrice}>
                    {item.price && item.price > 0 ? `$${item.price.toFixed(2)}` : t('cart.priceNotAvailable')}
                  </div>
                  
                  {item.inStock === false && (
                    <span className={styles.outOfStock}>{t('cart.outOfStock')}</span>
                  )}
                  
                  {(!item.name || !item.price || item.price <= 0) && (
                    <div className={styles.itemError}>
                      ⚠️ {t('cart.invalidProductData')}
                    </div>
                  )}
                </div>
                
                <div className={styles.itemControls}>
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className={styles.quantityButton}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className={styles.quantityButton}
                      disabled={item.inStock === false}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <div className={styles.itemActions}>
                    <button
                      onClick={() => addToWishlist(item)}
                      className={`${styles.wishlistButton} ${
                        isInWishlist(item.id) ? styles.wishlistButtonActive : ''
                      }`}
                      title={isInWishlist(item.id) ? t('cart.wishlist.inWishlist') : t('cart.wishlist.addToWishlist')}
                    >
                      {isInWishlist(item.id) ? <BsHeartFill /> : <BsHeart />}
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className={styles.removeButton}
                      title={t('cart.removeFromCart')}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.cartSummary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>{t('cart.summary.title')}</h3>
              
              {hasInvalidItems() && (
                <div className={styles.cartWarning}>
                  ⚠️ {t('cart.invalidItemsWarning')}
                </div>
              )}
              
              <div className={styles.summaryRow}>
                <span>{t('cart.summary.items', { count: cartItems.length })}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>{t('cart.summary.shipping')}</span>
                <span>
                  {shipping === 0 ? (
                    <span className={styles.freeShipping}>{t('cart.summary.freeShipping')}</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              
              {subtotal < 50 && (
                <div className={styles.shippingNote}>
                  <p>{t('cart.summary.freeShippingNote', { amount: (50 - subtotal).toFixed(2) })}</p>
                </div>
              )}
              
              <div className={styles.summaryDivider}></div>
              
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>{t('cart.summary.total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {orderError && (
                <div className={styles.errorMessage}>
                  <p>{t('cart.error', { error: orderError })}</p>
                  <button 
                    onClick={() => dispatch(clearError())}
                    className={styles.clearErrorButton}
                  >
                    {t('buttons.clear')}
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className={styles.loginWarning}>
                  <p>
                    {t('cart.loginRequired')} 
                    <button onClick={() => navigate('/login')} className={styles.loginLink}>
                      {t('auth.login')}
                    </button>
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                className={`${styles.checkoutButton} ${
                  hasInvalidItems() || !isAuthenticated ? styles.checkoutButtonDisabled : ''
                }`}
                disabled={
                  loading || 
                  orderLoading || 
                  hasInvalidItems() ||
                  !isAuthenticated ||
                  isEmpty
                }
              >
                {loading || orderLoading ? t('states.processing') : t('cart.proceedToCheckout')}
              </button>
              
              <button
                onClick={() => navigate('/shop')}
                className={styles.continueShoppingButton}
              >
                {t('cart.continueShopping')}
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => navigate('/orders')}
                  className={styles.viewOrdersButton}
                >
                  {t('cart.viewOrders')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;