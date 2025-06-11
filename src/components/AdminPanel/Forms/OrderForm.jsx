import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OrderForm.module.css';

const OrderForm = () => {
  const { t } = useTranslation();
  const [stockFilter, setStockFilter] = useState('all');
  const [product, setProduct] = useState({ instock: true });

  return (
    <div className={styles.container}>
      <div className={styles.filterGroup}>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">{t('adminPanel.forms.order.allStock')}</option>
          <option value="inStock">{t('adminPanel.forms.product.inStock')}</option>
          <option value="outOfStock">{t('adminPanel.forms.product.outOfStock')}</option>
        </select>
      </div>

      {/* Out of stock message */}
      {!product.instock && (
        <div className={styles.outOfStock}>
          {t('adminPanel.forms.product.outOfStock')}
        </div>
      )}
    </div>
  );
};

export default OrderForm; 