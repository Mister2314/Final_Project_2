import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateOrderStatus } from '../../../redux/slices/ordersSlice';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { StyledTableCell, StyledTableRow } from '../StyledTableComponents';
import styles from '../AdminPanel.module.css';

const OrdersTable = ({ 
  currentPageData, 
  emptyRows, 
  openModal, 
  handleDelete: onDelete 
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const formatPrice = useCallback((price) => {
    return Number(price).toFixed(2);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const formatStatus = useCallback((status) => {
    if (!status) return t('common.unknownStatus');
    
    try {
      const words = status.split(' ');
      return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase() +
             (words.length > 1 ? ' ' + words.slice(1).join(' ').toLowerCase() : '');
    } catch (error) {
      console.error('Error formatting status:', error);
      return status;
    }
  }, [t]);

  const getStatusBadgeClass = useMemo(() => {
    return (status) => {
      if (!status) return '';
      
      switch (status.toLowerCase()) {
        case 'sifarişiniz hazırlanır': return styles.statusPreparing;
        case 'təsdiq edildi': return styles.statusConfirmed;
        case 'yolda': return styles.statusInTransit;
        case 'çatdırıldı': return styles.statusDelivered;
        case 'ləğv edildi': return styles.statusCancelled;
        case 'geri qaytarıldı': return styles.statusReturned;
        case 'ödəniş gözləyir': return styles.statusWaitingPayment;
        default: return '';
      }
    };
  }, []);

  const handleCancelOrder = useCallback((orderId) => {
    dispatch(updateOrderStatus({ 
      orderId, 
      status: 'Ləğv edildi',
      orderData: {
        status: 'Ləğv edildi',
        updated_at: new Date().toISOString()
      }
    }));
  }, [dispatch]);

  const canCancelOrder = useCallback((status) => {
    if (!status) return false;
    const lowerStatus = status.toLowerCase();
    return lowerStatus === 'sifarişiniz hazırlanır' || 
           lowerStatus === 'təsdiq edildi' ||
           lowerStatus === 'ödəniş gözləyir';
  }, []);

  return (
    <TableContainer component={Paper} className={styles.tableWrapper}>
      <Table aria-label={t('adminPanel.table.ordersLabel')} className={styles.orderTable}>
        <TableHead>
          <TableRow>
            <StyledTableCell className={styles.orderIdColumn}>{t('adminPanel.table.orderId')}</StyledTableCell>
            <StyledTableCell className={styles.customerColumn}>{t('adminPanel.table.customerName')}</StyledTableCell>
            <StyledTableCell className={`${styles.productsColumn} ${styles.hideOnMobile}`}>{t('adminPanel.table.products')}</StyledTableCell>
            <StyledTableCell className={styles.totalColumn} align="right">{t('adminPanel.table.totalAmount')}</StyledTableCell>
            <StyledTableCell className={styles.statusColumn} align="center">{t('adminPanel.table.status')}</StyledTableCell>
            <StyledTableCell className={`${styles.dateColumn} ${styles.hideOnMobile}`}>{t('adminPanel.table.orderDate')}</StyledTableCell>
            <StyledTableCell className={styles.actionsColumn} align="center">{t('adminPanel.table.actions')}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentPageData.map((item) => (
            <StyledTableRow key={item.id}>
              <StyledTableCell className={styles.orderIdColumn}>
                <div className={styles.orderIdCell}>
                  <span className={styles.orderNumber}>#{item.id}</span>
                </div>
              </StyledTableCell>
              <StyledTableCell className={styles.customerColumn}>
                <div className={styles.customerInfo}>
                  <span className={styles.customerName} title={item.full_name}>
                    {item.full_name || t('common.unknownCustomer')}
                  </span>
                  <span className={styles.customerEmail} title={item.shipping_city}>
                    {item.shipping_city || t('common.noCity')}
                  </span>
                </div>
              </StyledTableCell>
              <StyledTableCell className={`${styles.productsColumn} ${styles.hideOnMobile}`}>
                <div className={styles.productsList}>
                  {(item.products || []).slice(0, 2).map((product, index) => (
                    <div key={`${item.id}-${product.id}-${index}`} className={styles.productItem}>
                      <span className={styles.productName}>
                        {product.name || t('common.unknownProduct')}
                      </span>
                      <span className={styles.productQuantity}>
                        {product.quantity || 0}x ₼{formatPrice(product.price || 0)}
                      </span>
                    </div>
                  ))}
                  {(item.products || []).length > 2 && (
                    <div className={styles.moreProducts}>
                      {t('adminPanel.table.moreItems', { count: item.products.length - 2 })}
                    </div>
                  )}
                </div>
              </StyledTableCell>
              <StyledTableCell className={styles.totalColumn} align="right">
                <span className={styles.totalAmount}>
                  ₼{formatPrice(item.total_price || 0)}
                </span>
              </StyledTableCell>
              <StyledTableCell className={styles.statusColumn} align="center">
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.status)}`}>
                  {formatStatus(item.status)}
                </span>
              </StyledTableCell>
              <StyledTableCell className={`${styles.dateColumn} ${styles.hideOnMobile}`}>
                {formatDate(item.created_at)}
              </StyledTableCell>
              <StyledTableCell className={styles.actionsColumn} align="center">
                <div className={styles.actionButtons}>
                  <button
                    className={styles.editButton}
                    onClick={() => openModal("order", "edit", item)}
                  >
                    ✏️ {t('adminPanel.actions.edit')}
                  </button>
                  {canCancelOrder(item.status) && (
                    <button
                      className={styles.cancelButton}
                      onClick={() => handleCancelOrder(item.id)}
                    >
                      ❌ {t('adminPanel.actions.cancel')}
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDelete("order", item.id)}
                  >
                    🗑️ {t('adminPanel.actions.delete')}
                  </button>
                </div>
              </StyledTableCell>
            </StyledTableRow>
          ))}
          {emptyRows > 0 && (
            <StyledTableRow style={{ height: 73 * emptyRows }}>
              <StyledTableCell colSpan={7} />
            </StyledTableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default React.memo(OrdersTable);