import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsHouseDoor, BsBag, BsHeart, BsShop } from 'react-icons/bs';
import { useCart } from 'react-use-cart';
import styles from './MobileTabBar.module.css';

// Thumb-reach bottom navigation (pack: mobile composition) — ≤768px only, safe-area aware.
const MobileTabBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { items: cartItems } = useCart();
  const cartCount = cartItems.length;
  const [pop, setPop] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 400);
      return () => clearTimeout(id);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  const tabs = [
    { to: '/', icon: <BsHouseDoor />, label: t('navbar.0') || 'Home', active: location.pathname === '/' },
    { to: '/shop', icon: <BsShop />, label: t('navbar.store') || 'Shop', active: location.pathname.startsWith('/shop') },
    { to: '/cart', icon: <BsBag />, label: 'Cart', active: location.pathname === '/cart', badge: cartCount },
    { to: '/wishlist', icon: <BsHeart />, label: 'Wishlist', active: location.pathname === '/wishlist' },
  ];

  return (
    <nav className={styles.tabBar} aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`${styles.tab} ${tab.active ? styles.active : ''}`}
          aria-current={tab.active ? 'page' : undefined}
        >
          <span className={styles.iconWrap}>
            {tab.icon}
            {tab.badge > 0 && (
              <span className={`${styles.badge} ${pop ? 'badge-pop' : ''}`}>{tab.badge}</span>
            )}
          </span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileTabBar;
