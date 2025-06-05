import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import styles from '../AdminPanel.module.css';

const OrderForm = ({
  orderForm,
  handleInputChange,
  products,
  users,
  handleProductQuantity,
  productFilter,
  setProductFilter,
  selectedCategory,
  setSelectedCategory,
  productCategories
}) => {
  const { t } = useTranslation();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nameAsc');

  const getFilteredProducts = () => {
    if (!products) return [];
    
    return products.filter(product => {
      const matchesSearch = product.nameEn.toLowerCase().includes(productFilter.toLowerCase()) ||
                          product.nameAz.toLowerCase().includes(productFilter.toLowerCase()) ||
                          product.main_name.toLowerCase().includes(productFilter.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.main_category === selectedCategory;
      
      const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || product.price <= parseFloat(priceRange.max));
      
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'inStock' && product.instock) ||
                          (stockFilter === 'outOfStock' && !product.instock);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'nameAsc':
          return a.nameEn.localeCompare(b.nameEn);
        case 'nameDesc':
          return b.nameEn.localeCompare(a.nameEn);
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  };

  const handleDateChange = (date, field) => {
    handleInputChange("order", field, date ? date.toISOString() : null);
  };

  return (
    <div className={styles.orderFormContainer}>
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t('adminPanel.forms.order.customerInfo')}</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('adminPanel.forms.order.customer')}</label>
            <select
              className={styles.formSelect}
              value={orderForm.user_id}
              onChange={(e) => handleInputChange("order", "user_id", e.target.value)}
              required
            >
              <option value="">{t('adminPanel.forms.order.selectCustomer')}</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('adminPanel.forms.order.fullName')}</label>
            <input
              type="text"
              className={styles.formInput}
              value={orderForm.full_name}
              onChange={(e) => handleInputChange("order", "full_name", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t('adminPanel.forms.order.dates')}</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('adminPanel.forms.order.orderDate')}</label>
            <DatePicker
              selected={orderForm.created_at ? new Date(orderForm.created_at) : null}
              onChange={(date) => handleDateChange(date, "created_at")}
              className={styles.formInput}
              dateFormat="yyyy-MM-dd HH:mm"
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              placeholderText={t('adminPanel.forms.order.selectOrderDate')}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('adminPanel.forms.order.expectedDeliveryDate')}</label>
            <DatePicker
              selected={orderForm.expected_delivery_date ? new Date(orderForm.expected_delivery_date) : null}
              onChange={(date) => handleDateChange(date, "expected_delivery_date")}
              className={styles.formInput}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              placeholderText={t('adminPanel.forms.order.selectExpectedDate')}
              required={!["Ləğv edildi", "Geri qaytarıldı"].includes(orderForm.status)}
            />
          </div>

          {orderForm.status === "Çatdırıldı" && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('adminPanel.forms.order.actualDeliveryDate')}</label>
              <DatePicker
                selected={orderForm.delivery_date ? new Date(orderForm.delivery_date) : null}
                onChange={(date) => handleDateChange(date, "delivery_date")}
                className={styles.formInput}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                placeholderText={t('adminPanel.forms.order.selectActualDate')}
                required={orderForm.status === "Çatdırıldı"}
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t('adminPanel.forms.order.shippingDetails')}</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('adminPanel.forms.order.shippingAddress')}</label>
            <textarea
              className={`${styles.formInput} ${styles.formTextarea}`}
              value={orderForm.shipping_address}
              onChange={(e) => handleInputChange("order", "shipping_address", e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('adminPanel.forms.order.city')}</label>
            <input
              type="text"
              className={styles.formInput}
              value={orderForm.shipping_city}
              onChange={(e) => handleInputChange("order", "shipping_city", e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('adminPanel.forms.order.zipCode')}</label>
            <input
              type="text"
              className={styles.formInput}
              value={orderForm.shipping_zip}
              onChange={(e) => handleInputChange("order", "shipping_zip", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t('adminPanel.forms.order.products')}</h3>
        
        <div className={styles.filterSection}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <input
                type="text"
                placeholder={t('adminPanel.forms.order.searchProducts')}
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categorySelect}
              >
                <option value="all">{t('adminPanel.forms.order.allCategories')}</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">{t('adminPanel.forms.order.allStock')}</option>
                <option value="inStock">{t('adminPanel.forms.order.inStock')}</option>
                <option value="outOfStock">{t('adminPanel.forms.order.outOfStock')}</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="nameAsc">{t('adminPanel.forms.order.sortNameAsc')}</option>
                <option value="nameDesc">{t('adminPanel.forms.order.sortNameDesc')}</option>
                <option value="priceAsc">{t('adminPanel.forms.order.sortPriceAsc')}</option>
                <option value="priceDesc">{t('adminPanel.forms.order.sortPriceDesc')}</option>
              </select>
            </div>
          </div>

          <div className={styles.priceFilterGroup}>
            <input
              type="number"
              placeholder={t('adminPanel.forms.order.minPrice')}
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className={styles.priceInput}
            />
            <span className={styles.priceSeparator}>-</span>
            <input
              type="number"
              placeholder={t('adminPanel.forms.order.maxPrice')}
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className={styles.priceInput}
            />
          </div>
        </div>

        <div className={styles.productSelectionContainer}>
          {getFilteredProducts().map((product) => (
            <div key={product.id} className={styles.productSelectionItem}>
              <div className={styles.productInfo}>
                <img
                  src={product.image}
                  alt={product.nameEn}
                  className={styles.productThumbnail}
                />
                <div className={styles.productDetails}>
                  <div className={styles.productName}>{product.nameEn}</div>
                  <div className={styles.productCategory}>{product.main_category}</div>
                  <div className={styles.productPrice}>₼{Number(product.price).toFixed(2)}</div>
                  {!product.instock && (
                    <div className={styles.outOfStock}>{t('adminPanel.forms.order.outOfStock')}</div>
                  )}
                </div>
              </div>
              <div className={styles.productQuantity}>
                <button
                  type="button"
                  className={styles.quantityButton}
                  onClick={() => handleProductQuantity(product.id, "decrease")}
                  disabled={!product.instock}
                >
                  -
                </button>
                <span className={styles.quantityDisplay}>
                  {orderForm.products.find(p => p.id === product.id)?.quantity || 0}
                </span>
                <button
                  type="button"
                  className={styles.quantityButton}
                  onClick={() => handleProductQuantity(product.id, "increase")}
                  disabled={!product.instock}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.selectedProductsSummary}>
          <h4 className={styles.summaryTitle}>{t('adminPanel.forms.order.selectedProducts')}</h4>
          <div className={styles.selectedProducts}>
            {orderForm.products.map((product) => {
              const productInfo = products.find(p => p.id === product.id);
              const price = productInfo?.price || 0;
              const subtotal = price * product.quantity;
              
              return (
                <div key={product.id} className={styles.selectedProductItem}>
                  <div className={styles.selectedProductInfo}>
                    <span className={styles.selectedProductName}>
                      {productInfo?.nameEn || product.name || t('common.unknownProduct')}
                    </span>
                    <span className={styles.selectedProductQuantity}>
                      {product.quantity} × ₼{price.toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.selectedProductTotal}>
                    ₼{subtotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
            {orderForm.products.length === 0 && (
              <div className={styles.emptySelection}>
                {t('adminPanel.forms.order.noProductsSelected')}
              </div>
            )}
          </div>
          <div className={styles.orderTotal}>
            <span>{t('adminPanel.forms.order.orderTotal')}:</span>
            <span className={styles.totalAmount}>₼{orderForm.total_price.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t('adminPanel.forms.order.orderStatus')}</h3>
        <div className={styles.formGroup}>
          <select
            className={styles.formSelect}
            value={orderForm.status}
            onChange={(e) => handleInputChange("order", "status", e.target.value)}
            required
          >
            <option value="Sifarişiniz hazırlanır">{t('adminPanel.orderStatus.preparing')}</option>
            <option value="Təsdiq edildi">{t('adminPanel.orderStatus.confirmed')}</option>
            <option value="Yolda">{t('adminPanel.orderStatus.inTransit')}</option>
            <option value="Çatdırıldı">{t('adminPanel.orderStatus.delivered')}</option>
            <option value="Ləğv edildi">{t('adminPanel.orderStatus.cancelled')}</option>
            <option value="Geri qaytarıldı">{t('adminPanel.orderStatus.returned')}</option>
            <option value="Ödəniş gözləyir">{t('adminPanel.orderStatus.waitingPayment')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderForm; 