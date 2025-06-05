import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { scrollManager } from '../utils/scrollManager';

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  const getLocationKey = (location) => {
    return `${location.pathname}${location.search}${location.hash}`;
  };

  // Save scroll position for product listing pages
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/shop' || 
          location.pathname.startsWith('/shop/cats') || 
          location.pathname.startsWith('/shop/dogs')) {
        scrollManager.saveScrollPosition(getLocationKey(location));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  // Handle scroll behavior on route changes
  useEffect(() => {
    const isProductListingPage = location.pathname === '/shop' || 
                                location.pathname.startsWith('/shop/cats') || 
                                location.pathname.startsWith('/shop/dogs');
    const locationKey = getLocationKey(location);

    // On initial load or refresh
    if (document.readyState === 'complete') {
      scrollManager.scrollToTop();
    }

    // On navigation
    if (navigationType === 'POP') {
      // Browser back/forward: restore scroll for product listings, scroll to top for others
      if (isProductListingPage) {
        scrollManager.restoreScrollPosition(locationKey);
      } else {
        scrollManager.scrollToTop();
      }
    } else {
      // Regular navigation: always scroll to top except for product listings
      if (!isProductListingPage) {
        scrollManager.scrollToTop();
        scrollManager.clearAllScrollPositions();
      }
    }
  }, [location, navigationType]);

  return null;
};

export default ScrollRestoration; 