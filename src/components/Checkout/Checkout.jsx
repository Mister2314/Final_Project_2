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
      newErrors.fullName = 'Ad və soyad tələb olunur';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Ad və soyad ən azı 2 hərf olmalıdır';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Ünvan tələb olunur';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Ünvan çox qısa görünür';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Şəhər tələb olunur';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'Şəhər adı düzgün deyil';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Poçt indeksi tələb olunur';
    } else if (!patterns.zipCode.test(formData.zipCode)) {
      newErrors.zipCode = 'Düzgün poçt indeksi daxil edin (4-6 rəqəm)';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Kart nömrəsi tələb olunur';
    } else if (!patterns.cardNumber.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Düzgün kart nömrəsi daxil edin (13-19 rəqəm)';
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Bitmə tarixi tələb olunur';
    } else if (!patterns.expiryDate.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Düzgün format: MM/YY';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const currentDate = new Date();
      currentDate.setDate(1); 
      
      if (expiryDate < currentDate) {
        newErrors.expiryDate = 'Kartın müddəti bitib';
      }
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV kodu tələb olunur';
    } else if (!patterns.cvv.test(formData.cvv)) {
      newErrors.cvv = 'Düzgün CVV kodu daxil edin (3-4 rəqəm)';
    }

    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Kart sahibinin adı tələb olunur';
    } else if (formData.cardHolderName.trim().length < 2) {
      newErrors.cardHolderName = 'Kart sahibinin adı çox qısa';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Sifariş şərtlərini qəbul etməlisiniz';
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
        toast.error('Kupon kodu daxil edin');
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
          toast.success(`Xoş gəldin kuponu tətbiq edildi! %10 endirim`);
        }
        return;
      }

      console.log('Applying coupon:', formData.couponCode); // Debug log
      const result = await dispatch(validateCoupon(formData.couponCode.trim())).unwrap();
      console.log('Coupon validation result:', result); // Debug log

      if (result && result.percentage) {
        toast.success(`Kupon tətbiq edildi! %${result.percentage} endirim`);
      } else {
        console.error('Invalid coupon response:', result); // Debug log
        toast.error('Yanlış kupon kodu');
      }
    } catch (error) {
      // Welcome10 kodu deyilsə xəta göstər
      if (formData.couponCode.trim().toLowerCase() !== 'welcome10') {
        console.error('Coupon application error:', error); // Debug log
        toast.error('Yanlış kupon kodu');
      }
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearCurrentCoupon());
    setFormData(prev => ({ ...prev, couponCode: '' }));
    setDefaultCouponApplied(false);
    toast.success('Kupon silindi');
  };

  const calculateTotal = () => {
    let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = calculateShipping();
    
    // Apply coupon discount if valid
    let discount = 0;
    if (currentCoupon && currentCoupon.percentage) {
      discount = (subtotal * currentCoupon.percentage) / 100;
      console.log('Calculating discount:', { subtotal, percentage: currentCoupon.percentage, discount }); // Debug log
    }
    
    const total = Math.max(0, subtotal - discount + shippingCost);
    console.log('Final total calculation:', { subtotal, discount, shippingCost, total }); // Debug log
    
    return {
      subtotal,
      discount,
      shipping: shippingCost,
      total
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (orderError) {
      dispatch(clearError());
    }
    
    if (!isAuthenticated || !user) {
      toast.error('Giriş etməlisiniz');
      navigate('/login');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Səbət boşdur');
      navigate('/cart');
      return;
    }

    if (!validateForm()) {
      toast.error('Zəhmət olmasa tələb olunan sahələri doldurun');
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
      const orderData = {
        user_id: user.id,
        products: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category
        })),
        total_price: total.total,
        full_name: formData.fullName.trim(),
        shipping_address: formData.address.trim(),
        shipping_city: formData.city.trim(),
        shipping_zip: formData.zipCode.trim()
      };

      await dispatch(createOrder({ orderData, coupon: currentCoupon })).unwrap();
      emptyCart();
      dispatch(clearCurrentCoupon());
      navigate('/order-completed');
    } catch (error) {
      toast.error(error.message || 'Sifariş xətası baş verdi');
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
        <h2>Səbətiniz boşdur</h2>
        <button onClick={() => navigate('/shop')}>
          Alış-verişə davam edin
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
          ← Geri
        </button>
        <h1 className={styles.title}>Ödəniş</h1>
      </div>

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>
              📍 Çatdırılma Ünvanı
            </h3>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Ad və Soyad *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.fullName ? styles.error : ''}`}
                  placeholder="Ad və soyadınızı daxil edin"
                />
                {errors.fullName && (
                  <span className={styles.errorText}>
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Ünvan *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.address ? styles.error : ''}`}
                  placeholder="Tam ünvanınızı daxil edin"
                />
                {errors.address && (
                  <span className={styles.errorText}>{errors.address}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Şəhər *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.city ? styles.error : ''}`}
                    placeholder="Şəhər"
                  />
                  {errors.city && (
                    <span className={styles.errorText}>{errors.city}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Poçt İndeksi *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.zipCode ? styles.error : ''}`}
                    placeholder="1234"
                  />
                  {errors.zipCode && (
                    <span className={styles.errorText}>{errors.zipCode}</span>
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
                  Profil məlumatlarını istifadə et
                </button>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>
              💳 Ödəniş Məlumatları
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Kart Nömrəsi *
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.cardNumber ? styles.error : ''}`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <span className={styles.errorText}>{errors.cardNumber}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Bitmə Tarixi *
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.expiryDate ? styles.error : ''}`}
                    placeholder="MM/YY"
                  />
                  {errors.expiryDate && (
                    <span className={styles.errorText}>{errors.expiryDate}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    CVV *
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.cvv ? styles.error : ''}`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <span className={styles.errorText}>{errors.cvv}</span>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Kart Sahibinin Adı *
                </label>
                <input
                  type="text"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.cardHolderName ? styles.error : ''}`}
                  placeholder="Kartda yazılan ad"
                />
                {errors.cardHolderName && (
                  <span className={styles.errorText}>{errors.cardHolderName}</span>
                )}
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.promoSection}`}>
            <h3>🎫 Kupon Kodu</h3>
            <div className={styles.promoInput}>
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleInputChange}
                placeholder="Kupon kodunuzu daxil edin"
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
                  Sil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCouponApply}
                  className={styles.applyButton}
                  disabled={couponLoading || !formData.couponCode.trim()}
                >
                  {couponLoading ? '...' : 'Tətbiq et'}
                </button>
              )}
            </div>
            {currentCoupon && (
              <div className={styles.discountInfo}>
                ✅ %{currentCoupon.percentage} endirim tətbiq edildi!
                {currentCoupon.code === 'welcome10' && (
                  <span style={{ display: 'block', fontSize: '0.85em', color: '#666', marginTop: '0.25rem' }}>
                    (Xoş gəldin kuponu)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.summaryColumn}>
          <div className={styles.orderSummary}>
            <h3 className={styles.summaryTitle}>Sifariş Xülasəsi</h3>
            
            {orderError && (
              <div style={{ 
                color: 'red', 
                padding: '0.5rem', 
                marginBottom: '1rem',
                backgroundColor: '#ffe6e6',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                Xəta: {orderError}
              </div>
            )}
            
            <div className={styles.orderItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemQuantity}>Miqdar: {item.quantity}</div>
                  </div>
                  <div className={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.totalRow}>
              <span>Məhsul qiyməti:</span>
              <span>${totalCalculation.subtotal.toFixed(2)}</span>
            </div>
            
            {currentCoupon && totalCalculation.discount > 0 && (
              <div className={styles.totalRow} style={{ color: '#28a745' }}>
                <span>Kupon endirimi (%{currentCoupon.percentage}):</span>
                <span>-${totalCalculation.discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className={styles.totalRow}>
              <span>Çatdırılma:</span>
              <span>{totalCalculation.shipping === 0 ? 'Pulsuz' : `$${totalCalculation.shipping.toFixed(2)}`}</span>
            </div>
            
            <div className={styles.finalTotal}>
              <span>Cəmi:</span>
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
                  Sifariş şərtlərini qəbul edirəm
                </span>
              </label>
              {errors.agreeToTerms && (
                <div className={styles.errorText} style={{ marginTop: '0.5rem' }}>
                  {errors.agreeToTerms}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isProcessing || orderLoading || !isAuthenticated}
              className={styles.submitButton}
            >
              🔒 {isProcessing || orderLoading ? 'Emal edilir...' : 'Sifarişi Tamamla'}
            </button>

            <div className={styles.securityNote}>
              🔒 Ödənişiniz təhlükəsiz şəkildə işlənir
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;