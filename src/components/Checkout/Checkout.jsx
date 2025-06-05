import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from 'react-use-cart';
import { createOrder, clearError, clearCurrentOrder, setCurrentOrder } from '../../redux/slices/ordersSlice'
import { validateCoupon, clearCurrentCoupon } from '../../redux/slices/couponsSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, cartTotal, emptyCart } = useCart();
  
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { loading: orderLoading, error: orderError, currentOrder } = useSelector(state => state.orders);
  const { currentCoupon, loading: couponLoading } = useSelector(state => state.coupons);
  
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    couponCode: 'welcome10', // Default kupon kodu
    
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [defaultCouponApplied, setDefaultCouponApplied] = useState(false);

  React.useEffect(() => {
    dispatch(clearCurrentOrder());
    if (orderError) {
      dispatch(clearError());
    }
  }, [dispatch, orderError]);

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || prev.fullName,
        address: user.address || prev.address,
        city: user.city || prev.city
      }));
    }
  }, [user]);

  // Default kupon kodunu avtomatik tətbiq et
  React.useEffect(() => {
    if (!defaultCouponApplied && !currentCoupon && formData.couponCode === 'welcome10') {
      handleCouponApply();
      setDefaultCouponApplied(true);
    }
  }, [defaultCouponApplied, currentCoupon, formData.couponCode]);

  const patterns = {
    cardNumber: /^[0-9]{13,19}$/,
    expiryDate: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
    cvv: /^[0-9]{3,4}$/,
    zipCode: /^[0-9]{4,6}$/
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; 
    }
    
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return;
    }
    
    if (name === 'cvv' && value.length > 4) return;
    if (name === 'zipCode' && value.length > 6) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'fullNameRequired';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'fullNameTooShort';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'addressRequired';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'addressTooShort';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'cityRequired';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'cityInvalid';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'zipRequired';
    } else if (!patterns.zipCode.test(formData.zipCode)) {
      newErrors.zipCode = 'zipInvalid';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'cardNumberRequired';
    } else if (!patterns.cardNumber.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'cardNumberInvalid';
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'expiryRequired';
    } else if (!patterns.expiryDate.test(formData.expiryDate)) {
      newErrors.expiryDate = 'expiryInvalid';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const currentDate = new Date();
      currentDate.setDate(1); 
      
      if (expiryDate < currentDate) {
        newErrors.expiryDate = 'expiryPast';
      }
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'cvvRequired';
    } else if (!patterns.cvv.test(formData.cvv)) {
      newErrors.cvv = 'cvvInvalid';
    }

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'cardHolderRequired';
    } else if (formData.cardHolderName.trim().length < 2) {
      newErrors.cardHolderName = 'cardHolderTooShort';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'termsRequired';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateShipping = () => {
    return cartTotal > 50 ? 0 : 9.99;
  };

  const handleCouponApply = async () => {
    try {
      if (!formData.couponCode.trim()) {
        toast.error(t('checkout.coupon.enterCode'));
        return;
      }

      // Welcome10 kodu üçün xüsusi işləmə
      if (formData.couponCode.trim().toLowerCase() === 'welcome10') {
        // Redux store-da kupon obyektini yaradırıq
        const welcomeCoupon = {
          code: 'welcome10',
          percentage: 10,
          valid: true
        };
        
        // Kuponu tətbiq edirik
        dispatch({ type: 'coupons/setCurrentCoupon', payload: welcomeCoupon });
        
        if (!defaultCouponApplied) {
          toast.success(t('checkout.coupon.discountApplied', { percentage: 10 }));
        }
        return;
      }

      console.log('Applying coupon:', formData.couponCode); // Debug log
      const result = await dispatch(validateCoupon(formData.couponCode.trim())).unwrap();
      console.log('Coupon validation result:', result); // Debug log

      if (result && result.percentage) {
        toast.success(t('checkout.coupon.discountApplied', { percentage: result.percentage }));
      } else {
        console.error('Invalid coupon response:', result); // Debug log
        toast.error(t('checkout.coupon.invalid'));
      }
    } catch (error) {
      // Welcome10 kodu deyilsə xəta göstər
      if (formData.couponCode.trim().toLowerCase() !== 'welcome10') {
        console.error('Coupon application error:', error); // Debug log
        toast.error(t('checkout.coupon.invalid'));
      }
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearCurrentCoupon());
    setFormData(prev => ({ ...prev, couponCode: '' }));
    setDefaultCouponApplied(false);
    toast.success(t('checkout.coupon.removed'));
  };

  const calculateTotal = () => {
    // Calculate subtotal from cart items
    let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    subtotal = Math.round(subtotal * 100) / 100; // Round to 2 decimal places
    
    // Calculate shipping cost
    const shippingCost = calculateShipping();
    
    // Calculate discount if coupon is applied
    let discount = 0;
    if (currentCoupon && currentCoupon.percentage) {
      discount = (subtotal * currentCoupon.percentage) / 100;
      discount = Math.round(discount * 100) / 100; // Round to 2 decimal places
      console.log('Calculating discount:', { subtotal, percentage: currentCoupon.percentage, discount });
    }
    
    // Calculate final total (subtotal - discount + shipping)
    const total = Math.round((subtotal - discount + shippingCost) * 100) / 100;
    console.log('Final total calculation:', { subtotal, discount, shippingCost, total });
    
    return {
      subtotal,
      discount,
      shipping: shippingCost,
      total
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error(t('toast.error.auth.loginRequired'));
      navigate('/login');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error(t('checkout.validation.emptyCart'));
      navigate('/cart');
      return;
    }

    if (!validateForm()) {
      toast.error(t('checkout.validation.fillRequired'));
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }
      return;
    }
    
    setIsProcessing(true);

    try {
      const total = calculateTotal();
      
      // Validate total calculation
      if (!total || typeof total.total !== 'number' || isNaN(total.total)) {
        toast.error(t('checkout.validation.invalidTotal'));
        return;
      }

      // Validate cart items
      const invalidItems = cartItems.filter(item => 
        !item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number'
      );

      if (invalidItems.length > 0) {
        console.error('Invalid items found:', invalidItems);
        toast.error(t('checkout.validation.invalidItems'));
        return;
      }

      // Create minimal order data with only necessary fields
      const orderData = {
        user_id: user.id,
        products: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity)
        })),
        total_price: parseFloat(total.total), // This is the discounted total
        full_name: formData.fullName.trim(),
        shipping_address: formData.address.trim(),
        shipping_city: formData.city.trim(),
        shipping_zip: formData.zipCode.trim(),
        status: 'pending'
      };

      // Additional validation before dispatch
      if (isNaN(orderData.total_price)) {
        console.error('Invalid total price:', total.total);
        toast.error('Invalid total price');
        return;
      }

      if (!orderData.products.every(p => p.id && !isNaN(p.price) && !isNaN(p.quantity))) {
        console.error('Invalid product data:', orderData.products);
        toast.error('Invalid product data');
        return;
      }

      console.log('Submitting order with data:', orderData);

      const result = await dispatch(createOrder({ orderData })).unwrap();
      
      if (!result) {
        console.error('No result from createOrder');
        toast.error(t('checkout.error.orderCreationFailed'));
        return;
      }

      // Show success message only here
      toast.success(t('checkout.success.orderCreated'));
      emptyCart();
      dispatch(clearCurrentCoupon());
      navigate('/order-completed');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(t('checkout.error.orderCreationFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    if (currentOrder && !orderLoading && !orderError) {
      console.log('Order created successfully, current order:', currentOrder);
    }
  }, [currentOrder, orderLoading, orderError]);

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>{t('checkout.emptyCart.title')}</h2>
        <button onClick={() => navigate('/shop')}>
          {t('checkout.emptyCart.continueShopping')}
        </button>
      </div>
    );
  }

  const totalCalculation = calculateTotal();

  return (
    <div className={styles.checkout}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate('/cart')}
          className={styles.backButton}
        >
          ← {t('checkout.back')}
        </button>
        <h1 className={styles.title}>{t('checkout.title')}</h1>
      </div>

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>
              {t('checkout.shippingAddress.title')}
            </h3>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {t('checkout.shippingAddress.fullName')}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.fullName ? styles.error : ''}`}
                  placeholder={t('checkout.shippingAddress.fullNamePlaceholder')}
                />
                {errors.fullName && (
                  <span className={styles.errorText}>
                    {t(`checkout.validation.${errors.fullName}`)}
                  </span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {t('checkout.shippingAddress.address')}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.address ? styles.error : ''}`}
                  placeholder={t('checkout.shippingAddress.addressPlaceholder')}
                />
                {errors.address && (
                  <span className={styles.errorText}>
                    {t(`checkout.validation.${errors.address}`)}
                  </span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    {t('checkout.shippingAddress.city')}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.city ? styles.error : ''}`}
                    placeholder={t('checkout.shippingAddress.cityPlaceholder')}
                  />
                  {errors.city && (
                    <span className={styles.errorText}>
                      {t(`checkout.validation.${errors.city}`)}
                    </span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    {t('checkout.shippingAddress.zipCode')}
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.zipCode ? styles.error : ''}`}
                    placeholder={t('checkout.shippingAddress.zipCodePlaceholder')}
                  />
                  {errors.zipCode && (
                    <span className={styles.errorText}>
                      {t(`checkout.validation.${errors.zipCode}`)}
                    </span>
                  )}
                </div>
              </div>

              {user && (user.full_name || user.address || user.city) && (
                <button 
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      fullName: user.full_name || prev.fullName,
                      address: user.address || prev.address,
                      city: user.city || prev.city
                    }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      if (user.full_name) delete newErrors.fullName;
                      if (user.address) delete newErrors.address;
                      if (user.city) delete newErrors.city;
                      return newErrors;
                    });
                  }}
                  className={styles.useProfileButton}
                  style={{ 
                    marginTop: '1rem', 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#f0f0f0', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('checkout.shippingAddress.useProfileData')}
                </button>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>
              {t('checkout.payment.title')}
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {t('checkout.payment.cardNumber')}
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.cardNumber ? styles.error : ''}`}
                  placeholder={t('checkout.payment.cardNumberPlaceholder')}
                />
                {errors.cardNumber && (
                  <span className={styles.errorText}>
                    {t(`checkout.validation.${errors.cardNumber}`)}
                  </span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    {t('checkout.payment.expiryDate')}
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.expiryDate ? styles.error : ''}`}
                    placeholder={t('checkout.payment.expiryDatePlaceholder')}
                  />
                  {errors.expiryDate && (
                    <span className={styles.errorText}>
                      {t(`checkout.validation.${errors.expiryDate}`)}
                    </span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    {t('checkout.payment.cvv')}
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.cvv ? styles.error : ''}`}
                    placeholder={t('checkout.payment.cvvPlaceholder')}
                  />
                  {errors.cvv && (
                    <span className={styles.errorText}>
                      {t(`checkout.validation.${errors.cvv}`)}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {t('checkout.payment.cardHolderName')}
                </label>
                <input
                  type="text"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.cardHolderName ? styles.error : ''}`}
                  placeholder={t('checkout.payment.cardHolderNamePlaceholder')}
                />
                {errors.cardHolderName && (
                  <span className={styles.errorText}>
                    {t(`checkout.validation.${errors.cardHolderName}`)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.promoSection}`}>
            <h3>{t('checkout.coupon.title')}</h3>
            <div className={styles.promoInput}>
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleInputChange}
                placeholder={t('checkout.coupon.placeholder')}
                disabled={currentCoupon || couponLoading}
                className={`${styles.input} ${currentCoupon ? styles.inputDisabled : ''}`}
              />
              {currentCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className={styles.removeButton}
                  disabled={couponLoading}
                >
                  {t('checkout.coupon.remove')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCouponApply}
                  className={styles.applyButton}
                  disabled={couponLoading || !formData.couponCode.trim()}
                >
                  {couponLoading ? t('checkout.coupon.loading') : t('checkout.coupon.apply')}
                </button>
              )}
            </div>
            {currentCoupon && (
              <div className={styles.discountInfo}>
                {t('checkout.coupon.discountApplied', { percentage: currentCoupon.percentage })}
                {currentCoupon.code === 'welcome10' && (
                  <span style={{ display: 'block', fontSize: '0.85em', color: '#666', marginTop: '0.25rem' }}>
                    {t('checkout.coupon.welcomeDiscount')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.summaryColumn}>
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>{t('checkout.summary.title')}</h3>
            
            {orderError && (
              <div style={{ 
                color: 'red', 
                padding: '0.5rem', 
                marginBottom: '1rem',
                backgroundColor: '#ffe6e6',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                {t('checkout.summary.error', { message: orderError })}
              </div>
            )}
            
            <div className={styles.orderItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemQuantity}>
                      {t('checkout.summary.quantity', { count: item.quantity })}
                    </div>
                  </div>
                  <div className={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.totalRow}>
              <span>{t('checkout.summary.subtotal')}</span>
              <span>${totalCalculation.subtotal.toFixed(2)}</span>
            </div>
            
            {currentCoupon && totalCalculation.discount > 0 && (
              <div className={styles.totalRow} style={{ color: '#28a745' }}>
                <span>{t('checkout.summary.discount', { percentage: currentCoupon.percentage })}</span>
                <span>-${totalCalculation.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className={styles.totalRow}>
              <span>{t('checkout.summary.shipping')}</span>
              <span>{totalCalculation.shipping === 0 ? t('checkout.summary.free') : `$${totalCalculation.shipping.toFixed(2)}`}</span>
            </div>
            
            <div className={styles.finalTotal}>
              <span>{t('checkout.summary.total')}</span>
              <span>${totalCalculation.total.toFixed(2)}</span>
            </div>

            <div className={styles.termsSection}>
              <label className={styles.termsCheckbox}>
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                />
                <span className={styles.termsText}>
                  {t('checkout.summary.terms')}
                </span>
              </label>
              {errors.agreeToTerms && (
                <div className={styles.errorText} style={{ marginTop: '0.5rem' }}>
                  {t('checkout.validation.termsRequired')}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isProcessing || orderLoading || !isAuthenticated}
              className={styles.submitButton}
            >
              🔒 {isProcessing || orderLoading ? t('checkout.summary.processing') : t('checkout.summary.completeOrder')}
            </button>

            <div className={styles.securityNote}>
              {t('checkout.summary.securityNote')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;