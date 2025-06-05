import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../AdminPanel.module.css';

const ProductForm = ({ productForm, handleInputChange, errors }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.productFormContainer}>
      {/* Other form fields */}

      {/* Discount Section */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t('adminPanel.forms.product.discountLabel')}</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <input
              type="checkbox"
              checked={productForm.isDiscount}
              onChange={(e) => handleInputChange("product", "isDiscount", e.target.checked)}
              className={styles.formCheckbox}
            />
            {t('adminPanel.forms.product.isOnSale')}
          </label>
        </div>

        {productForm.isDiscount && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t('adminPanel.forms.product.discountPercentage')}
              <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className={`${styles.formInput} ${
                errors.discount ? styles.inputError : ''
              }`}
              value={productForm.discount}
              onChange={(e) => handleInputChange("product", "discount", e.target.value)}
              placeholder={t('adminPanel.forms.product.enterDiscountPercentage')}
              required={productForm.isDiscount}
            />
            <small className={styles.formHelp}>
              {t('adminPanel.forms.product.discountHelp')}
            </small>
            {errors.discount && (
              <span className={styles.errorText}>
                {t('adminPanel.forms.product.invalidDiscount')}
              </span>
            )}
          </div>
        )}

        {productForm.isDiscount && productForm.discount > 0 && (
          <div className={styles.discountPreview}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>
                {t('adminPanel.forms.product.originalPrice')}:
              </span>
              <span className={styles.originalPrice}>
                ${Number(productForm.price).toFixed(2)}
              </span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>
                {t('adminPanel.forms.product.discountedPrice')}:
              </span>
              <span className={styles.discountedPrice}>
                ${(Number(productForm.price) * (1 - productForm.discount / 100)).toFixed(2)}
              </span>
            </div>
            <div className={styles.saveAmount}>
              {t('adminPanel.forms.product.saveAmount', {
                amount: (Number(productForm.price) * (productForm.discount / 100)).toFixed(2)
              })}
            </div>
          </div>
        )}
      </div>

      {/* Other form sections */}
    </div>
  );
};

export default ProductForm; 