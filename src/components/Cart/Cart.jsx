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
import Navbar from '../../layout/Header/Navbar/Navbar';
import Footer from '../../layout/Footer/Footer';

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
    <>
      <Navbar />
      <div className={styles.cartContainer}>
        <div className={styles.cartHeader}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <FaArrowLeft />
            <span>{t('buttons.back')}</span>
          </button>
          <h1 className={styles.cartTitle}>
            <IoBagHandleOutline className={styles.titleIcon} />
            {t('cart.title')} ({cartItems.length})
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
                        {t('cart.invalidProduct')}
                      </div>
                    )}
                    
                    <div className={styles.itemControls}>
                      <div className={styles.quantityControls}>
                        <button 
                          className={styles.quantityButton}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button 
                          className={styles.quantityButton}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      <div className={styles.itemActions}>
                        <button 
                          className={styles.wishlistButton}
                          onClick={() => addToWishlist(item)}
                          title={t('cart.moveToWishlist')}
                        >
                          {isInWishlist(item.id) ? <BsHeartFill /> : <BsHeart />}
                        </button>
                        <button 
                          className={styles.removeButton}
                          onClick={() => handleRemoveItem(item.id)}
                          title={t('cart.remove')}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.cartSummary}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>{t('cart.summary')}</h2>
                
                <div className={styles.summaryRow}>
                  <span>{t('cart.subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>{t('cart.shipping')}</span>
                  <span>
                    {shipping === 0 ? (
                      <span className={styles.freeShipping}>{t('cart.freeShipping')}</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className={styles.shippingNote}>
                  <p>{t('cart.shippingNote')}</p>
                </div>
                
                <div className={styles.totalRow}>
                  <span>{t('cart.total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                {!isAuthenticated && (
                  <div className={styles.loginWarning}>
                    <p>{t('cart.loginToCheckout')}</p>
                    <button 
                      onClick={() => navigate('/login')}
                      className={styles.loginLink}
                    >
                      {t('buttons.login')}
                    </button>
                  </div>
                )}
                
                <button
                  className={styles.checkoutButton}
                  onClick={handleCheckout}
                  disabled={isEmpty || hasInvalidItems() || !isAuthenticated}
                >
                  {t('cart.checkout')}
                </button>
                
                <button
                  className={styles.continueShoppingButton}
                  onClick={() => navigate('/shop')}
                >
                  {t('cart.continue')}
                </button>
                
                {isAuthenticated && (
                  <button
                    className={styles.viewOrdersButton}
                    onClick={() => navigate('/orders')}
                  >
                    {t('cart.viewOrders')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;