import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getUserOrders, clearError, updateOrderStatus } from '../../redux/slices/ordersSlice';
import styles from './Orders.module.css';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import Spinner from '../Spinner/Spinner';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

const Orders = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dialogState, openDialog, closeDialog } = useConfirmDialog();
  
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { userOrders: orders, loading, error } = useSelector(state => state.orders);
  
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [isOrdersLoaded, setIsOrdersLoaded] = useState(false);

  const orderVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const expandVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    }
  };

  const iconVariants = {
    collapsed: { rotate: 0 },
    expanded: { rotate: 180 }
  };

  const orderStatuses = useMemo(() => [
    { key: 'Sifarişiniz hazırlanır', label: t('orders.status.preparing'), color: '#f39c12', icon: '🔄' },
    { key: 'Təsdiq edildi', label: t('orders.status.confirmed'), color: '#3498db', icon: '✓' },
    { key: 'Yolda', label: t('orders.status.inTransit'), color: '#2ecc71', icon: '🚚' },
    { key: 'Çatdırıldı', label: t('orders.status.delivered'), color: '#27ae60', icon: '✅' },
    { key: 'Ləğv edildi', label: t('orders.status.cancelled'), color: '#e74c3c', icon: '❌' },
    { key: 'Geri qaytarıldı', label: t('orders.status.returned'), color: '#95a5a6', icon: '↩️' },
    { key: 'Ödəniş gözləyir', label: t('orders.status.waitingPayment'), color: '#e67e22', icon: '💳' }
  ], [t]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error(t('auth.unauthorized'));
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        await dispatch(getUserOrders(user.id)).unwrap();
        setIsOrdersLoaded(true);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(t('orders.fetchError'));
      }
    };

    fetchOrders();
  }, [dispatch, user, isAuthenticated, navigate, t]);

  useEffect(() => {
    if (error) {
      toast.error(t('orders.error'));
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  const handleCancelOrder = (orderId) => {
    openDialog({
      title: t('orders.cancelConfirmTitle'),
      message: t('orders.cancelConfirmMessage'),
      onConfirm: async () => {
        try {
          await dispatch(updateOrderStatus({ 
            orderId, 
            status: 'Ləğv edildi' 
          })).unwrap();
          
          toast.success(t('orders.cancelSuccess'));
          dispatch(getUserOrders(user.id));
        } catch (error) {
          toast.error(t('orders.cancelError'));
        }
        closeDialog();
      }
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#FFA500',
      processing: '#3498db',
      shipped: '#2ecc71',
      delivered: '#27ae60',
      cancelled: '#e74c3c'
    };
    return statusColors[status] || '#FFA500';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Sifarişiniz hazırlanır': '🔄',
      'Təsdiq edildi': '✓',
      'Yolda': '🚚',
      'Çatdırıldı': '✅',
      'Ləğv edildi': '❌',
      'Geri qaytarıldı': '↩️',
      'Ödəniş gözləyir': '💳'
    };
    return statusIcons[status] || '⏳';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'Sifarişiniz hazırlanır': t('orders.status.preparing'),
      'Təsdiq edildi': t('orders.status.confirmed'),
      'Yolda': t('orders.status.inTransit'),
      'Çatdırıldı': t('orders.status.delivered'),
      'Ləğv edildi': t('orders.status.cancelled'),
      'Geri qaytarıldı': t('orders.status.returned'),
      'Ödəniş gözləyir': t('orders.status.waitingPayment')
    };
    return statusMap[status] || status;
  };

  const handleReorder = (order) => {
    // Add reorder logic here
    toast.success(t('orders.reorderSuccess'));
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...(orders || [])];

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(order => 
          ['Sifarişiniz hazırlanır', 'Təsdiq edildi', 'Yolda'].includes(order.status)
        );
      } else if (statusFilter === 'completed') {
        result = result.filter(order => order.status === 'Çatdırıldı');
      } else if (statusFilter === 'cancelled') {
        result = result.filter(order => ['Ləğv edildi', 'Geri qaytarıldı'].includes(order.status));
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'highestAmount':
          return b.total_amount - a.total_amount;
        case 'lowestAmount':
          return a.total_amount - b.total_amount;
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return result;
  }, [orders, statusFilter, sortOption]);

  if (loading) {
    return (
      <motion.div 
        className={styles.loadingContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Spinner size="large" />
        <p className={styles.loadingText}>{t('orders.loading')}</p>
      </motion.div>
    );
  }

  if (isOrdersLoaded && (!orders || orders.length === 0)) {
    return (
      <motion.div 
        className={styles.emptyContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.emptyIcon}>🛍️</div>
        <h2 className={styles.emptyTitle}>{t('orders.emptyStateTitle')}</h2>
        <p className={styles.emptyMessage}>{t('orders.emptyStateDescription')}</p>
        <motion.button 
          className={styles.shopButton}
          onClick={() => navigate('/shop')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('orders.shopNow')}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.ordersContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.ordersWrapper}>
        <motion.div 
          className={styles.ordersHeader}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            <span className={styles.backIcon}>←</span>
            {t('common.back')}
          </button>
          <h1 className={styles.ordersTitle}>{t('orders.title')}</h1>
        </motion.div>

        <motion.div 
          className={styles.filtersSection}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.filterControls}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">{t('orders.filters.allOrders')}</option>
              <option value="active">{t('orders.filters.activeOrders')}</option>
              <option value="completed">{t('orders.filters.completedOrders')}</option>
              <option value="cancelled">{t('orders.filters.cancelledOrders')}</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">{t('orders.sort.newest')}</option>
              <option value="oldest">{t('orders.sort.oldest')}</option>
              <option value="highestAmount">{t('orders.sort.highestAmount')}</option>
              <option value="lowestAmount">{t('orders.sort.lowestAmount')}</option>
            </select>
          </div>
        </motion.div>

        <motion.div 
          className={styles.ordersList}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <AnimatePresence mode="wait">
            {filteredAndSortedOrders.map((order, index) => (
              <motion.div
                key={order.id}
                className={styles.orderCard}
                variants={orderVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.1 }}
                layout
              >
                <div 
                  className={styles.orderHeader}
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className={styles.orderInfo}>
                    <div className={styles.orderMeta}>
                      <h3 className={styles.orderNumber}>
                        {t('orders.orderNumber')} {order.id}
                      </h3>
                      <span className={styles.orderDate}>
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div 
                      className={styles.orderStatus}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {getStatusText(order.status)}
                    </div>
                  </div>
                  <motion.div 
                    className={styles.expandIcon}
                    variants={iconVariants}
                    initial="collapsed"
                    animate={expandedOrder === order.id ? "expanded" : "collapsed"}
                    transition={{ duration: 0.3 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  {expandedOrder === order.id && (
                    <motion.div
                      className={styles.orderContent}
                      variants={expandVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <div className={styles.productsList}>
                        {order.products.map((product) => (
                          <motion.div
                            key={product.id}
                            className={styles.productItem}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className={styles.productImageWrapper}>
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className={styles.productImage}
                              />
                            </div>
                            <div className={styles.productInfo}>
                              <h4 className={styles.productName}>{product.name}</h4>
                              <div className={styles.productDetails}>
                                <span>{t('orders.quantity')}: {product.quantity}</span>
                                <span>{t('orders.price')}: ${(product.price || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className={styles.orderDetails}>
                        <div className={styles.orderSummary}>
                          <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>{t('orders.total')}</span>
                            <span>${(order.products || []).reduce((sum, product) => 
                              sum + ((product.price || 0) * (product.quantity || 1)), 0).toFixed(2)}</span>
                          </div>
                        </div>

                        {order.status === 'Sifarişiniz hazırlanır' && (
                          <div className={styles.orderActions}>
                            <motion.button
                              className={styles.cancelButton}
                              onClick={() => handleCancelOrder(order.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {t('orders.cancelOrderButton')}
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
      />
    </motion.div>
  );
};

export default Orders;