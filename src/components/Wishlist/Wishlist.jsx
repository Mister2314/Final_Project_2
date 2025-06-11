import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { BsHeart, BsTrash, BsArrowLeft } from 'react-icons/bs';
import styles from './Wishlist.module.css';
import { useWishlist } from 'react-use-wishlist';
import { useCart } from 'react-use-cart';
import { errorToast, successToast } from '../../utils/toast';

const Wishlist = () => {
  const { t, i18n } = useTranslation();
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  
  const { 
    items: wishlist, 
    addWishlistItem, 
    removeWishlistItem, 
    emptyWishlist,
    inWishlist 
  } = useWishlist();
  
  const isAzerbaijani = i18n.language === 'az';

  const getCategoryDisplayName = (product, isAz = true) => {
    if (product.main_name) {
      if (isAz) {
        return product.main_name === 'cat' ? 'Pişiklər' : 'İtlər';
      } else {
        return product.main_name === 'cat' ? 'Cats' : 'Dogs';
      }
    }
    
    if (isAz && product.categoryAz) {
      return product.categoryAz;
    }
    if (!isAz && product.categoryEn) {
      return product.categoryEn;
    }
    
    if (product.category) {
      if (isAz) {
        return product.category === 'cats' || product.category === 'cat' ? 'Pişiklər' : 'İtlər';
      } else {
        return product.category === 'cats' || product.category === 'cat' ? 'Cats' : 'Dogs';
      }
    }
    
     };

  const handleRemoveFromWishlist = (itemId) => {
    try {
      removeWishlistItem(itemId);
      successToast('toast.success.wishlist.remove');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      errorToast('toast.error.wishlist.remove');
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const getDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const handleClearWishlist = () => {
    try {
      emptyWishlist();
      successToast('toast.success.wishlist.clear');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      errorToast('toast.error.wishlist.clear');
    }
  };

  const handleAddToCart = (item) => {
    try {
      if (items.some(cartItem => cartItem.id === item.id)) {
        errorToast('toast.error.wishlist.cart.alreadyExists');
        return;
      }

      const name = isAzerbaijani ? item.nameAz : item.nameEn;
      if (!item.id || !name || !item.price || item.price <= 0) {
        errorToast('toast.error.wishlist.invalidProduct');
        return;
      }

      const cartItem = {
        id: item.id,
        name: name,
        nameAz: item.nameAz || name,
        nameEn: item.nameEn || name,
        price: item.isDiscount 
          ? getDiscountedPrice(item.price, item.discount)
          : item.price,
        image: item.image,
        category: item.category,
        main_name: item.main_name,
        main_category: item.main_category,
        quantity: 1,
        isDiscount: item.isDiscount,
        discount: item.discount,
        originalPrice: item.price,
        inStock: item.instock !== false
      };

      addItem(cartItem);
      removeWishlistItem(item.id);
      successToast('toast.success.wishlist.moveToCart');
    } catch (error) {
      errorToast('toast.error.wishlist.moveToCart');
    }
  };

  return (
    <div className={styles.wishlistContainer}>      
      <div className={styles.wishlistContent}>
        <div className={styles.wishlistHeader}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BsArrowLeft />
          </button>
          
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>
              <BsHeart className={styles.heartIcon} />
              {isAzerbaijani ? 'Mənim Wishlist\'im' : 'My Wishlist'}
            </h1>
            <p className={styles.itemCount}>
              {wishlist.length} {isAzerbaijani ? 'məhsul' : 'items'}
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <button 
              className={styles.clearButton}
              onClick={handleClearWishlist}
            >
              <BsTrash />
              {isAzerbaijani ? 'Hamısını sil' : 'Clear All'}
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <div className={styles.emptyIcon}>💝</div>
            <h2 className={styles.emptyTitle}>
              {isAzerbaijani ? 'Wishlist\'iniz boşdur' : 'Your wishlist is empty'}
            </h2>
            <p className={styles.emptyText}>
              {isAzerbaijani 
                ? 'Bəyəndiyiniz məhsulları buraya əlavə edin'
                : 'Add products you love to your wishlist'
              }
            </p>
            <button 
              className={styles.shopButton}
              onClick={() => navigate('/shop')}
            >
              {isAzerbaijani ? 'Alış-verişə başla' : 'Start Shopping'}
            </button>
          </div>
        ) : (
          <div className={styles.wishlistGrid}>
            {wishlist.map((product) => (
              <div key={product.id} className={styles.wishlistItem}>
                <div className={styles.productImageContainer}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={isAzerbaijani ? product.nameAz : product.nameEn}
                      className={styles.productImage}
                      onClick={() => handleProductClick(product)}
                    />
                  ) : (
                    <div className={styles.productImagePlaceholder}>📦</div>
                  )}
                  
                  {product.isDiscount && (
                    <div className={styles.discountBadge}>
                      -{Math.round(product.discount)}%
                    </div>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <h3 
                    className={styles.productName}
                    onClick={() => handleProductClick(product)}
                  >
                    {isAzerbaijani ? product.nameAz : product.nameEn}
                  </h3>
                  
                  <div className={styles.productCategory}>
                    {getCategoryDisplayName(product, isAzerbaijani)}
                  </div>

                  <div className={styles.productPricing}>
                    {product.isDiscount ? (
                      <div className={styles.discountedPricing}>
                        <span className={styles.originalPrice}>
                          {isAzerbaijani ? `${product.price} ₼` : `$${product.price}`}
                        </span>
                        <span className={styles.discountedPrice}>
                          {isAzerbaijani 
                            ? `${getDiscountedPrice(product.price, product.discount).toFixed(2)} ₼` 
                            : `$${getDiscountedPrice(product.price, product.discount).toFixed(2)}`}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.regularPrice}>
                        {isAzerbaijani ? `${product.price} ₼` : `$${product.price}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.productActions}>
                  <button 
                    className={styles.addToCartButton}
                    onClick={() => handleAddToCart(product)}
                  >
                    {isAzerbaijani ? 'Səbətə əlavə et' : 'Add to Cart'}
                  </button>
                  
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleProductClick(product)}
                  >
                    {isAzerbaijani ? 'Məhsula bax' : 'View Product'}
                  </button>
                  
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    aria-label="Remove from wishlist"
                  >
                    <BsTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;