import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getAllOrders, calculateOrderStatistics } from '../../../../redux/slices/ordersSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import styles from './OrderStatistics.module.css';

const OrderStatistics = () => {
  const dispatch = useDispatch();
  const { orders, statistics, loading } = useSelector(state => state.orders);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslation();

  // Memoize formatPrice function to prevent recreation on each render
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 2
    }).format(price);
  }, []);

  // Memoize formatStatus function
  const formatStatus = useCallback((status) => {
    if (!status) return '';
    const words = status.split(' ');
    return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase() +
           (words.length > 1 ? ' ' + words.slice(1).join(' ').toLowerCase() : '');
  }, []);

  // Memoize truncate functions
  const truncateProductName = useCallback((name, maxLength = 25) => {
    if (name && name.length > maxLength) {
      return name.substring(0, maxLength) + '...';
    }
    return name || t('common.noProductName');
  }, [t]);

  const truncateCustomerName = useCallback((name, maxLength = 20) => {
    if (name && name.length > maxLength) {
      return name.substring(0, maxLength) + '...';
    }
    return name || t('common.user');
  }, [t]);

  // Memoize status colors
  const statusColors = useMemo(() => ({
    'Gözləyir': '#ffc107',
    'Təsdiq edildi': '#17a2b8',
    'Sifarişiniz hazırlanır': '#fd7e14',
    'Yolda': '#6f42c1',
    'Çatdırıldı': '#28a745',
    'Ləğv edildi': '#dc3545',
    'Geri qaytarıldı': '#6c757d',
    'Ödəniş gözləyir': '#e83e8c',
    'default': '#6c63ff'
  }), []);

  const getStatusColor = useCallback((status) => {
    return statusColors[status] || statusColors['default'];
  }, [statusColors]);

  // Fetch data only when needed
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await dispatch(getAllOrders());
        dispatch(calculateOrderStatistics());
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, refreshKey]);

  // Memoize formatted stats
  const formattedStatusStats = useMemo(() => {
    return statistics?.statusStats?.map(stat => ({
      ...stat,
      status: formatStatus(stat.status)
    })) || [];
  }, [statistics?.statusStats, formatStatus]);

  const formattedCategoryStats = useMemo(() => {
    return statistics?.categoryStats
      ?.filter(stat => stat.category && stat.category.trim() !== '')
      ?.map(stat => ({
        ...stat,
        category: stat.category.trim(),
        count: stat.count || 0,
        revenue: stat.revenue || 0
      }))
      ?.sort((a, b) => b.count - a.count) || [];
  }, [statistics?.categoryStats]);

  // Memoize actual product details calculation
  const actualProducts = useMemo(() => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    
    const productMap = new Map();
    
    orders.forEach(order => {
      if (!order?.products || !Array.isArray(order.products)) return;
      
      order.products.forEach(product => {
        if (!product?.id || !product.main_name || !product.main_category) return;
        
        const existing = productMap.get(product.id) || {
          id: product.id,
          name: product.name || product.main_name,
          main_name: product.main_name,
          category: product.main_category,
          image: product.image,
          price: product.price || product.current_price || 0,
          count: 0,
          revenue: 0
        };
        
        const quantity = parseInt(product.quantity) || 1;
        const price = parseFloat(product.price || product.current_price) || 0;
        
        existing.count += quantity;
        existing.revenue += price * quantity;
        productMap.set(product.id, existing);
      });
    });

    return Array.from(productMap.values())
      .filter(product => product.category && product.category.trim() !== '')
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [orders]);

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const COLORS = useMemo(() => ['#6c63ff', '#28a745', '#ffc107', '#17a2b8', '#ff5a5f', '#e83e8c', '#fd7e14', '#20c997'], []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          {t('states.loading')}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.emptyStateIcon}>📊</div>
          <div>{t('states.noData')}</div>
          <button className={styles.button} onClick={refreshData}>
            🔄 {t('buttons.refresh')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        <div className={styles.title}>
          📊 {t('statistics.orderStats')}
        </div>

        <div className={styles.headerActions}>
          <button className={styles.button} onClick={refreshData}>
            🔄 {t('buttons.refresh')}
          </button>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.card}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statValue}>{statistics.totalOrders || 0}</div>
              <div className={styles.statLabel}>{t('statistics.totalOrders')}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statValue}>{formatPrice(statistics.totalRevenue || 0)}</div>
              <div className={styles.statLabel}>{t('statistics.totalRevenue')}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statValue}>
                {statistics.totalOrders > 0 ? formatPrice(statistics.totalRevenue / statistics.totalOrders) : formatPrice(0)}
              </div>
              <div className={styles.statLabel}>{t('statistics.averageOrderValue')}</div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>👥 {t('statistics.recentCustomers')}</h3>
          {statistics.recentCustomers && statistics.recentCustomers.length > 0 ? (
            <div className={styles.customersGrid}>
              {statistics.recentCustomers.map((customer, index) => (
                <div key={`customer-${customer.userId}-${index}`} className={styles.recentCustomerItem}>
                  <div className={styles.customerRank}>
                    #{index + 1}
                  </div>
                  <div className={styles.customerAvatar}>
                    👤
                  </div>
                  <div className={styles.customerInfo}>
                    <div 
                      className={styles.customerName}
                      title={customer.userName}
                    >
                      {truncateCustomerName(customer.userName)}
                    </div>
                    <div className={styles.customerOrderDate}>
                      {t('statistics.lastOrder')}: {customer.lastOrderDate}
                    </div>
                  </div>
                  <div className={styles.customerStats}>
                    <div className={styles.customerOrderCount}>
                      {customer.orderCount} {t('statistics.orders')}
                    </div>
                    <div className={styles.customerProductCount}>
                      {customer.totalProducts} {t('statistics.products')}
                    </div>
                    <div className={styles.customerTotalSpent}>
                      {formatPrice(customer.totalSpent)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noData}>
              {t('statistics.noCustomerData')}
            </div>
          )}
        </div>

        <div className={styles.chartsGrid}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>🏷️ {t('statistics.salesByCategory')}</h3>
            {formattedCategoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formattedCategoryStats}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ category, count, percent }) => 
                      `${category}: ${count} (${(percent * 100).toFixed(1)}%)`
                    }
                  >
                    {formattedCategoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, t('statistics.count')]}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-color)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>
                {t('states.noData')}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>📅 {t('statistics.monthlySalesTrend')}</h3>
            {statistics.monthlyStats && statistics.monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'orders' ? `${value} ${t('statistics.orders')}` : formatPrice(value),
                      name === 'orders' ? t('statistics.orders') : t('statistics.revenue')
                    ]}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-color)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="orders" fill="var(--button-bg)" name={t('statistics.orders')} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--success-color)" 
                    strokeWidth={3} 
                    name={t('statistics.revenue')} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.noData}>
                {t('states.noData')}
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>📊 {t('statistics.orderStatusDistribution')}</h3>
          {formattedStatusStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formattedStatusStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="status" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  formatter={(value) => [value, t('statistics.count')]}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-color)'
                  }}
                />
                <Bar dataKey="count">
                  {formattedStatusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>
              {t('states.noData')}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>🏆 {t('statistics.topSellingCategories')}</h3>
          {statistics.categoryStats && statistics.categoryStats.length > 0 ? (
            <div className={styles.categoriesGrid}>
              {statistics.categoryStats.slice(0, 8).map((category, index) => (
                <div key={`category-${index}`} className={styles.topCategoryItem}>
                  <div className={styles.categoryRank}>
                    #{index + 1}
                  </div>
                  <div className={styles.categoryInfo}>
                    <div 
                      className={styles.categoryName}
                      title={category.category}
                    >
                      {category.category}
                    </div>
                  </div>
                  <div className={styles.categoryStats}>
                    <div className={styles.categoryCount}>
                      {category.count} {t('statistics.items')}
                    </div>
                    <div className={styles.categoryRevenue}>
                      {formatPrice(category.revenue || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noData}>
              {t('states.noData')}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>🥇 {t('statistics.topSellingProducts')}</h3>
          {actualProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {actualProducts.map((product, index) => (
                <div key={`product-${product.id}-${index}`} className={styles.topProductItem}>
                  <div className={styles.productRank}>
                    #{index + 1}
                  </div>
                  <div className={styles.productImageContainer}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className={styles.productImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={styles.productImagePlaceholder}
                      style={{ display: product.image ? 'none' : 'flex' }}
                    >
                      📦
                    </div>
                  </div>
                  <div className={styles.productInfo}>
                    <div 
                      className={styles.productName}
                      title={product.name}
                    >
                      {truncateProductName(product.name)}
                    </div>
                    <div className={styles.productCategory}>
                      {product.category}
                    </div>
                    <div className={styles.productPrice}>
                      {formatPrice(product.price || 0)}
                    </div>
                  </div>
                  <div className={styles.productStats}>
                    <div className={styles.productCount}>
                      {product.count} {t('statistics.items')}
                    </div>
                    <div className={styles.productRevenue}>
                      {formatPrice(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noData}>
              {t('states.noData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize the entire component
export default React.memo(OrderStatistics);