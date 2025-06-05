import React, { useEffect, useState, useMemo, useCallback, lazy, Suspense, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProducts, clearError } from '../../redux/slices/productSlices';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';
import styles from './ProductsTemplate.module.css';
import { useTranslation } from 'react-i18next';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useWishlist } from 'react-use-wishlist';
import { toast } from 'react-hot-toast';
import { useCart } from 'react-use-cart';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { errorToast, successToast } from '../../utils/toast';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import { Disclosure, Transition, Listbox, Switch } from '@headlessui/react';
import { ChevronUpIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import Spinner from '../Spinner/Spinner';

const Slider = lazy(() => import('@mui/material/Slider'));

const PriceRangeSlider = React.memo(({ priceRange, minMaxPrices, onPriceChange, isAzerbaijani }) => {
  const [localMin, setLocalMin] = useState(priceRange[0]);
  const [localMax, setLocalMax] = useState(priceRange[1]);

  useEffect(() => {
    setLocalMin(priceRange[0]);
    setLocalMax(priceRange[1]);
  }, [priceRange]);

  const debouncedPriceChange = useCallback(
    debounce((newValue) => {
      onPriceChange(newValue);
    }, 300),
    [onPriceChange]
  );

  const handleInputChange = (value, isMin) => {
    let newValue = parseInt(value) || 0;
    
    if (isMin) {
      newValue = Math.max(minMaxPrices.min, Math.min(newValue, localMax));
      setLocalMin(newValue);
    } else {
      newValue = Math.max(localMin, Math.min(newValue, minMaxPrices.max));
      setLocalMax(newValue);
    }
  };

  const handleInputBlur = () => {
    debouncedPriceChange([localMin, localMax]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className={styles.priceSliderContainer}>
      <div className={styles.priceInputsContainer}>
        <div className={styles.priceInputWrapper}>
          <input
            type="number"
            value={localMin}
            onChange={(e) => handleInputChange(e.target.value, true)}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            min={minMaxPrices.min}
            max={localMax}
            className={styles.priceInput}
            placeholder={isAzerbaijani ? "Min" : "Min"}
          />
          <span className={styles.currencySymbol}>₼</span>
        </div>
        <span className={styles.priceSeparator}>-</span>
        <div className={styles.priceInputWrapper}>
          <input
            type="number"
            value={localMax}
            onChange={(e) => handleInputChange(e.target.value, false)}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            min={localMin}
            max={minMaxPrices.max}
            className={styles.priceInput}
            placeholder={isAzerbaijani ? "Max" : "Max"}
          />
          <span className={styles.currencySymbol}>₼</span>
        </div>
      </div>
      <Suspense fallback={<div className={styles.sliderPlaceholder} />}>
        <Slider
          value={[localMin, localMax]}
          onChange={(_, newValue) => {
            setLocalMin(newValue[0]);
            setLocalMax(newValue[1]);
            debouncedPriceChange(newValue);
          }}
          valueLabelDisplay="auto"
          min={minMaxPrices.min}
          max={minMaxPrices.max}
          sx={{
            color: '#4a90e2',
            '& .MuiSlider-thumb': {
              backgroundColor: '#fff',
              border: '2px solid #4a90e2',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(74, 144, 226, 0.16)',
              },
              '&.Mui-active': {
                boxShadow: '0 0 0 12px rgba(74, 144, 226, 0.16)',
              },
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e9ecef',
            },
          }}
        />
      </Suspense>
    </div>
  );
});

PriceRangeSlider.displayName = 'PriceRangeSlider';

const CustomSelect = React.memo(({ 
  value, 
  onChange, 
  options, 
  label, 
  isAzerbaijani,
  index 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div 
      className={`${styles.customSelect} ${styles['selectWrapper' + index]}`}
      ref={selectRef}
    >
      <label className={styles.selectLabel}>{label}</label>
      <div className={styles.selectContainer}>
        <button
          type="button"
          className={`${styles.selectButton} ${isOpen ? styles.active : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={styles.selectText}>
            {selectedOption?.label}
          </span>
          <span className={`${styles.selectArrow} ${isOpen ? styles.open : ''}`}>
            ▼
          </span>
        </button>

        {isOpen && (
          <div className={styles.optionsContainer}>
            <div className={styles.optionsScroll}>
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.optionText}>{option.label}</span>
                  {option.count !== undefined && (
                    <span className={styles.optionCount}>({option.count})</span>
                  )}
                  {value === option.value && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const CustomCheckbox = React.memo(({ 
  checked, 
  onChange, 
  label, 
  count 
}) => {
  return (
    <div 
      className={styles.checkboxContainer}
      onClick={() => onChange(!checked)}
    >
      <div className={`${styles.checkbox} ${checked ? styles.checked : ''}`}>
        {checked && <span className={styles.checkmark}>✓</span>}
      </div>
      <div className={styles.checkboxContent}>
        <span className={styles.checkboxLabel}>{label}</span>
        {count !== undefined && (
          <span className={styles.checkboxCount}>({count})</span>
        )}
      </div>
    </div>
  );
});

const SmartFilters = React.memo(({ 
  showAllFilters,
  setShowAllFilters,
  sortedProducts,
  isAzerbaijani,
  children 
}) => {
  return (
    <div className={styles.smartFilters}>
      <div className={styles.filtersHeader}>
        <div className={styles.filtersTitle}>
          <span className={styles.filtersIcon}>⚡</span>
          <h3>{isAzerbaijani ? 'Ağıllı Filterlər' : 'Smart Filters'}</h3>
        </div>
        
        <div className={styles.filtersControls}>
          <span className={styles.productsCount}>
            {isAzerbaijani 
              ? `${sortedProducts.length} məhsul`
              : `${sortedProducts.length} products`
            }
          </span>
          
          <button
            className={`${styles.toggleButton} ${showAllFilters ? styles.active : ''}`}
            onClick={() => setShowAllFilters(!showAllFilters)}
          >
            <span className={styles.toggleIcon}>
              {showAllFilters ? '📤' : '📥'}
            </span>
            {showAllFilters 
              ? (isAzerbaijani ? 'Filtrləri Bağla' : 'Close Filters')
              : (isAzerbaijani ? 'Filtrləri Aç' : 'Open Filters')
            }
          </button>
        </div>
      </div>

      {showAllFilters && (
        <div className={styles.filtersContent}>
          <div className={styles.filtersGrid}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
});

const FilterSection = React.memo(({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.filterSection}>
      <button 
        className={styles.sectionHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>{icon}</span>
          <h4>{title}</h4>
        </div>
        <span className={`${styles.sectionArrow} ${isOpen ? styles.open : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className={styles.sectionContent}>
          {children}
        </div>
      )}
    </div>
  );
});

// Helper function for calculating discounted price
const getDiscountedPrice = (price, discount) => {
  return price - (price * (discount / 100));
};

const ProductsTemplate = ({ 
  pageConfig = {},
  filterParams = {},
  smartFilters = [],
  mainCategoryFilters = [],
  showCategoryFilter = true,
  showStockFilter = true,
  customStyles = null
}) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const { addItem } = useCart();
  const { 
    addWishlistItem, 
    removeWishlistItem, 
    inWishlist 
  } = useWishlist();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [allProducts, setAllProducts] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [stockFilters, setStockFilters] = useState([]);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minMaxPrices, setMinMaxPrices] = useState({ min: 0, max: 1000 });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 
  const { products, loading, error } = useSelector((state) => state.products);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isAzerbaijani = currentLang === 'az';

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const defaultConfig = {
    title: {
      az: 'Bütün Məhsullar',
      en: 'All Products'
    },
    subtitle: {
      az: 'Heyvanlarınız üçün bütün məhsulları kəşf edin',
      en: 'Discover our complete collection of premium pet products'
    },
    icon: '🐾',
    searchPlaceholder: {
      az: 'Məhsul axtar...',
      en: 'Search products...'
    }
  };

  const config = { ...defaultConfig, ...pageConfig };
  const getEnhancedCategoryName = (originalCategory, isAzerbaijani = false) => {
    if (!originalCategory) return originalCategory;
    
    const categoryMappings = {
      'food': {
        az: 'İt Yemleri',
        en: 'Dog Foods'
      },
      'toys': {
        az: 'İt Oyuncaqları',
        en: 'Dog Toys'
      },
      'accessories': {
        az: 'İt Aksesuarları',
        en: 'Dog Accessories'
      },
      'grooming': {
        az: 'İt Baxım Məhsulları',
        en: 'Dog Grooming Products'
      },
      'health': {
        az: 'İt Sağlamlıq Məhsulları',
        en: 'Dog Health Products'
      },
      'beds': {
        az: 'İt Yataqları',
        en: 'Dog Beds'
      },
      'treats': {
        az: 'İt Ləzzətləri',
        en: 'Dog Treats'
      },
      'collars': {
        az: 'İt Boyunbağları',
        en: 'Dog Collars'
      },
      'leashes': {
        az: 'İt Qayışları',
        en: 'Dog Leashes'
      },
      'bowls': {
        az: 'İt Qabları',
        en: 'Dog Bowls'
      },
      'carriers': {
        az: 'İt Daşıyıcıları',
        en: 'Dog Carriers'
      },
      'clothing': {
        az: 'İt Geyimləri',
        en: 'Dog Clothing'
      }
    };

    const isCatsPage = filterParams.main_name === 'cat' || location.pathname.includes('/cats/');
    
    if (isCatsPage) {
      const catMappings = {
        'food': {
          az: 'Pişik Yemleri',
          en: 'Cat Foods'
        },
        'toys': {
          az: 'Pişik Oyuncaqları',
          en: 'Cat Toys'
        },
        'accessories': {
          az: 'Pişik Aksesuarları',
          en: 'Cat Accessories'
        },
        'grooming': {
          az: 'Pişik Baxım Məhsulları',
          en: 'Cat Grooming Products'
        },
        'health': {
          az: 'Pişik Sağlamlıq Məhsulları',
          en: 'Cat Health Products'
        },
        'beds': {
          az: 'Pişik Yataqları',
          en: 'Cat Beds'
        },
        'treats': {
          az: 'Pişik Ləzzətləri',
          en: 'Cat Treats'
        },
        'collars': {
          az: 'Pişik Boyunbağları',
          en: 'Cat Collars'
        },
        'litter': {
          az: 'Pişik Qumu',
          en: 'Cat Litter'
        },
        'scratching': {
          az: 'Dırmıqlama Məhsulları',
          en: 'Scratching Posts'
        },
        'bowls': {
          az: 'Pişik Qabları',
          en: 'Cat Bowls'
        },
        'carriers': {
          az: 'Pişik Daşıyıcıları',
          en: 'Cat Carriers'
        },
        'clothing': {
          az: 'Pişik Geyimləri',
          en: 'Cat Clothing'
        }
      };
      
      const mapping = catMappings[originalCategory.toLowerCase()];
      if (mapping) {
        return isAzerbaijani ? mapping.az : mapping.en;
      }
    }
      

       return originalCategory.charAt(0).toUpperCase() + originalCategory.slice(1);
  };

  useEffect(() => {
    setSearchTerm('');
    setSortBy('newest');
    setFilterBy('all');
    setCategoryFilter('all');
    setCategoryFilters([]);
    setPriceFilters([]);
    setStockFilters([]);
    setMinPrice('');
    setMaxPrice('');
    setPriceRange([0, 1000]);
    setShowAllFilters(false);
    setIsInitialLoad(true);
  }, [location.pathname]); 

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await dispatch(fetchProducts(filterParams)).unwrap();
        setHasAttemptedLoad(true);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error loading products:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
          setHasAttemptedLoad(true);
          setIsInitialLoad(false);
          errorToast('products.loadError');
        }
      }
    };

    if (isInitialLoad || retryCount > 0) {
      loadProducts();
    }
  }, [dispatch, filterParams, isInitialLoad, retryCount]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      setIsInitialLoad(true);
      setHasAttemptedLoad(false);
      setRetryCount(0);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!loading && products) {
      setAllProducts(products);
      setIsInitialLoad(false);
    }
  }, [loading, products]);

  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(product => product.price);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setMinMaxPrices({ min, max });
      setPriceRange([min, max]);
    }
  }, [products]);

  const categoryStats = useMemo(() => {
    const stats = {};
    products.forEach(product => {
      if (product.main_category) {
        const originalCategory = product.main_category.toLowerCase();
        const enhancedCategory = getEnhancedCategoryName(originalCategory, isAzerbaijani);
        
        if (!stats[enhancedCategory]) {
          stats[enhancedCategory] = {
            count: 0,
            originalCategory: originalCategory
          };
        }
        stats[enhancedCategory].count += 1;
      }
    });
    
    return Object.entries(stats).map(([name, data]) => ({ 
      name, 
      count: data.count, 
      originalCategory: data.originalCategory 
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, isAzerbaijani]);

  const handlePriceRangeChange = useCallback((newRange) => {
    setPriceRange(newRange);
    const priceFilter = {
      min: newRange[0],
      max: newRange[1]
    };
    setPriceFilters([priceFilter]);
  }, []);

  const priceStats = useMemo(() => {
    if (!products.length) return { min: 0, max: 1000, ranges: [] };
    
    const prices = products.map(p => p.isDiscount ? getDiscountedPrice(p.price, p.discount) : p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      ranges: [
        { label: isAzerbaijani ? '0 - 50 ₼' : '$0 - $50', min: 0, max: 50 },
        { label: isAzerbaijani ? '50 - 100 ₼' : '$50 - $100', min: 50, max: 100 },
        { label: isAzerbaijani ? '100 - 200 ₼' : '$100 - $200', min: 100, max: 200 },
        { label: isAzerbaijani ? '200+ ₼' : '$200+', min: 200, max: Infinity }
      ]
    };
  }, [products, isAzerbaijani]);

  const stockOptions = [
    { 
      key: 'inStock', 
      label: isAzerbaijani ? 'Stokda var' : 'In Stock',
      count: products.filter(p => p.instock).length
    },
    { 
      key: 'outOfStock', 
      label: isAzerbaijani ? 'Stokda yox' : 'Out of Stock',
      count: products.filter(p => !p.instock).length
    }
  ];

  const handleCategoryFilterChange = (enhancedCategory, originalCategory, checked) => {
    if (checked) {
      setCategoryFilters(prev => [...prev, { enhanced: enhancedCategory, original: originalCategory }]);
      setCategoryFilter('all');
    } else {
      setCategoryFilters(prev => prev.filter(c => c.enhanced !== enhancedCategory));
    }
  };

  const handlePriceFilterChange = (range, checked) => {
    if (checked) {
      setPriceFilters(prev => [...prev, range]);
    } else {
      setPriceFilters(prev => prev.filter(r => r !== range));
    }
  };

  const handleStockFilterChange = (stock, checked) => {
    if (checked) {
      setStockFilters([stock]);
    } else {
      setStockFilters([]);
    }
  };

  const clearAllFilters = () => {
    setCategoryFilters([]);
    setPriceFilters([]);
    setStockFilters([]);
    setMinPrice('');
    setMaxPrice('');
    setPriceRange([priceStats.min, priceStats.max]);
    setSortBy('newest');
    setFilterBy('all');
    setCategoryFilter('all');
  };

  const removeFilter = (type, value) => {
    switch (type) {
      case 'category':
        setCategoryFilters(prev => prev.filter(c => c.enhanced !== value));
        break;
      case 'price':
        setPriceFilters(prev => prev.filter(p => p !== value));
        break;
      case 'stock':
        setStockFilters(prev => prev.filter(s => s !== value));
        break;
    }
  };

  const activeFilters = useMemo(() => {
    const filters = [];
    
    categoryFilters.forEach(cat => {
      filters.push({ type: 'category', value: cat.enhanced, label: cat.enhanced });
    });
    
    priceFilters.forEach(price => {
      filters.push({ type: 'price', value: price, label: price.label });
    });
    
    stockFilters.forEach(stock => {
      const option = stockOptions.find(opt => opt.key === stock);
      filters.push({ type: 'stock', value: stock, label: option?.label || stock });
    });
    
    return filters;
  }, [categoryFilters, priceFilters, stockFilters, isAzerbaijani]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setConfirmDialog({
        isOpen: true,
        title: isAzerbaijani ? 'Giriş Tələb Olunur' : 'Login Required',
        message: isAzerbaijani 
          ? 'Məhsulu səbətə əlavə etmək üçün daxil olmalısınız. Daxil olmaq istəyirsiniz?' 
          : 'You need to be logged in to add items to your cart. Would you like to log in now?',
        onConfirm: () => {
          navigate('/login');
        },
      });
      return;
    }
    
    if (!product.instock) {
      errorToast(isAzerbaijani ? 'Məhsul stokda yoxdur' : 'Product is out of stock');
      return;
    }
    
    const cartItem = {
      id: product.id,
      name: isAzerbaijani ? product.nameAz : product.nameEn,
      price: product.isDiscount 
        ? getDiscountedPrice(product.price, product.discount)
        : product.price,
      image: product.image,
      category: isAzerbaijani ? product.categoryAz : product.categoryEn,
      originalPrice: product.price,
      isDiscount: product.isDiscount,
      discount: product.discount || 0,
      quantity: 1,
      inStock: product.instock
    };
    
    try {
      addItem(cartItem);
      successToast(isAzerbaijani ? 'Məhsul səbətə əlavə edildi' : 'Product added to cart');
    } catch (error) {
      errorToast(isAzerbaijani ? 'Xəta baş verdi' : 'An error occurred');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (categoryFilter !== 'all') {
        if (!product.main_category || product.main_category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // Category filters from checkboxes
      if (categoryFilters.length > 0) {
        const matchesCategory = categoryFilters.some(cat => 
          product.main_category?.toLowerCase() === cat.original.toLowerCase()
        );
        if (!matchesCategory) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = 
          (product.nameAz && product.nameAz.toLowerCase().includes(searchLower)) ||
          (product.nameEn && product.nameEn.toLowerCase().includes(searchLower));
        const matchesCategory = 
          (product.categoryAz && product.categoryAz.toLowerCase().includes(searchLower)) ||
          (product.categoryEn && product.categoryEn.toLowerCase().includes(searchLower));
        
        if (!matchesName && !matchesCategory) {
          return false;
        }
      }

      // Price range filter
      const productPrice = parseFloat(product.price);
      if (priceRange[0] > productPrice || priceRange[1] < productPrice) {
        return false;
      }

      // Stock filters
      if (stockFilters.length > 0) {
        if (stockFilters.includes('inStock') && !product.instock) {
          return false;
        }
        if (stockFilters.includes('outOfStock') && product.instock) {
          return false;
        }
      }

      // Filter by type (all, discounted, regular, inStock, outOfStock)
      switch (filterBy) {
        case 'discounted':
          if (!product.isDiscount) return false;
          break;
        case 'regular':
          if (product.isDiscount) return false;
          break;
        case 'inStock':
          if (!product.instock) return false;
          break;
        case 'outOfStock':
          if (product.instock) return false;
          break;
      }

      // Custom smart filters
      if (smartFilters && smartFilters.length > 0) {
        const passesCustomFilters = smartFilters.every(filterFn => {
          if (typeof filterFn === 'function') {
            return filterFn(product);
          }
          return true; 
        });
        if (!passesCustomFilters) {
          return false;
        }
      }

      return true;
    });
  }, [products, categoryFilter, categoryFilters, searchTerm, priceRange, stockFilters, smartFilters, filterBy]);

  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'price-low':
        sorted.sort((a, b) => {
          const priceA = a.isDiscount ? getDiscountedPrice(a.price, a.discount) : a.price;
          const priceB = b.isDiscount ? getDiscountedPrice(b.price, b.discount) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        sorted.sort((a, b) => {
          const priceA = a.isDiscount ? getDiscountedPrice(a.price, a.discount) : a.price;
          const priceB = b.isDiscount ? getDiscountedPrice(b.price, b.discount) : b.price;
          return priceB - priceA;
        });
        break;
      case 'name-a':
        sorted.sort((a, b) => {
          const nameA = isAzerbaijani ? (a.nameAz || '') : (a.nameEn || '');
          const nameB = isAzerbaijani ? (b.nameAz || '') : (b.nameEn || '');
          return nameA.localeCompare(nameB);
        });
        break;
      case 'name-z':
        sorted.sort((a, b) => {
          const nameA = isAzerbaijani ? (a.nameAz || '') : (a.nameEn || '');
          const nameB = isAzerbaijani ? (b.nameAz || '') : (b.nameEn || '');
          return nameB.localeCompare(nameA);
        });
        break;
    }
    
    return sorted;
  }, [filteredProducts, sortBy, isAzerbaijani]);

  const categoryOptions = useMemo(() => {
    const categories = new Map();
    
    products.forEach(product => {
      if (product.main_category) {
        const category = product.main_category.toLowerCase();
        const count = categories.get(category) || 0;
        categories.set(category, count + 1);
      }
    });
    
    const options = Array.from(categories).map(([value, count]) => ({
      value,
      label: getEnhancedCategoryName(value, isAzerbaijani),
      count
    }));
    
    return [
      { value: 'all', label: isAzerbaijani ? 'Bütün Kateqoriyalar' : 'All Categories', count: products.length },
      ...options.sort((a, b) => a.label.localeCompare(b.label))
    ];
  }, [products, isAzerbaijani]);

  const handleProductClick = (product) => {
    if (!product.instock) {
      toast.error(isAzerbaijani ? 'Bu məhsul hal-hazırda stokda yoxdur' : 'This product is currently out of stock');
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const sortOptions = useMemo(() => [
    { value: 'newest', label: isAzerbaijani ? 'Ən Yeni' : 'Newest' },
    { value: 'oldest', label: isAzerbaijani ? 'Ən Köhnə' : 'Oldest' },
    { value: 'price-low', label: isAzerbaijani ? 'Qiymət: Aşağıdan Yuxarı' : 'Price: Low to High' },
    { value: 'price-high', label: isAzerbaijani ? 'Qiymət: Yuxarıdan Aşağı' : 'Price: High to Low' },
    { value: 'name-a', label: isAzerbaijani ? 'Ad: A-Z' : 'Name: A-Z' },
    { value: 'name-z', label: isAzerbaijani ? 'Ad: Z-A' : 'Name: Z-A' }
  ], [isAzerbaijani]);

  const filterByOptions = useMemo(() => [
    { value: 'all', label: isAzerbaijani ? 'Bütün Məhsullar' : 'All Products' },
    { value: 'discounted', label: isAzerbaijani ? 'Yalnız Endirimlilər' : 'Discounted Only' },
    { value: 'regular', label: isAzerbaijani ? 'Adi Qiymət' : 'Regular Price' },
    ...(showStockFilter ? [
      { value: 'inStock', label: isAzerbaijani ? 'Stokda Var' : 'In Stock' },
      { value: 'outOfStock', label: isAzerbaijani ? 'Stokda Yoxdur' : 'Out of Stock' }
    ] : [])
  ], [isAzerbaijani, showStockFilter]);

  const petCounts = useMemo(() => {
    const counts = {
      cat: allProducts.filter(p => p.main_name === 'cat').length,
      dog: allProducts.filter(p => p.main_name === 'dog').length,
    };
    counts.all = counts.cat + counts.dog;
    return counts;
  }, [allProducts]);

  const updatedSmartFilters = useMemo(() => {
    return smartFilters.map(filter => {
      if (filter.field === 'main_name') {
        return {
          ...filter,
          options: filter.options.map(option => ({
            ...option,
            count: option.value === 'all' ? petCounts.all : petCounts[option.value] || 0
          }))
        };
      }
      return filter;
    });
  }, [smartFilters, petCounts]);

  const renderSortAndFilters = () => (
    <div className={styles.selectGroup}>
      <CustomSelect
        value={sortBy}
        onChange={setSortBy}
        options={sortOptions}
        label={isAzerbaijani ? 'Sıralama' : 'Sort by'}
        isAzerbaijani={isAzerbaijani}
        index={1}
      />
      <CustomSelect
        value={filterBy}
        onChange={setFilterBy}
        options={filterByOptions}
        label={isAzerbaijani ? 'Məhsul növü' : 'Product type'}
        isAzerbaijani={isAzerbaijani}
        index={2}
      />
    </div>
  );

  const renderCategoryFilters = () => (
    <div className={styles.checkboxGrid}>
      {categoryStats.map(cat => (
        <CustomCheckbox
          key={cat.originalCategory}
          checked={categoryFilters.some(filter => filter.enhanced === cat.name)}
          onChange={(checked) => handleCategoryFilterChange(cat.name, cat.originalCategory, checked)}
          label={cat.name}
          count={cat.count}
        />
      ))}
    </div>
  );

  const renderStockFilters = () => (
    <div className={styles.checkboxGrid}>
      {stockOptions.map(option => (
        <CustomCheckbox
          key={option.key}
          checked={stockFilters.includes(option.key)}
          onChange={(checked) => handleStockFilterChange(option.key, checked)}
          label={option.label}
          count={option.count}
        />
      ))}
    </div>
  );

  if (loading || (!hasAttemptedLoad && isInitialLoad)) {
    return (
      <div className={styles.productsLoadingContainer}>
        <Spinner size="large" />
        <p>{t('products.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>❌</div>
          <h2>{t('products.errorTitle')}</h2>
          <p>{t('products.errorDescription')}</p>
          <button 
            className={styles.retryButton}
            onClick={() => {
              setIsInitialLoad(true);
              setRetryCount(0);
            }}
          >
            {t('products.retryButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={customStyles ? customStyles.dogsPageContainer : styles.allProductsContainer}>
      <Header />
      <main className={customStyles ? customStyles.mainContent : styles.mainContent}>
        <div className={customStyles ? customStyles.heroSection : styles.heroSection}>
          <div className={customStyles ? customStyles.heroContent : styles.heroContent}>
            <h1 className={customStyles ? customStyles.heroTitle : styles.heroTitle}>
              <span className={customStyles ? customStyles.dogIcon : styles.categoryIcon}>
                {pageConfig.icon}
              </span>
              {isAzerbaijani ? pageConfig.title.az : pageConfig.title.en}
          </h1>
            <p className={customStyles ? customStyles.heroSubtitle : styles.heroSubtitle}>
              {isAzerbaijani ? pageConfig.subtitle.az : pageConfig.subtitle.en}
          </p>
        </div>
      </div>

        <div className={customStyles ? customStyles.contentWrapper : styles.contentWrapper}>
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder={isAzerbaijani ? config.searchPlaceholder.az : config.searchPlaceholder.en}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
        </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
            <p>{t('products.loading')}</p>
          </div>
        ) : (
            <div className={styles.productsSection}>
            <SmartFilters
              showAllFilters={showAllFilters}
              setShowAllFilters={setShowAllFilters}
              sortedProducts={sortedProducts}
              isAzerbaijani={isAzerbaijani}
            >
              <FilterSection 
                title={isAzerbaijani ? 'Sıralama & Tez Filterlər' : 'Sort & Quick Filters'}
                icon="🎯"
              >
                {renderSortAndFilters()}
              </FilterSection>

              {updatedSmartFilters.map((filter, index) => (
                <FilterSection
                  key={index}
                  title={filter.title}
                  icon={filter.icon}
                >
                  <div className={styles.checkboxGrid}>
                    {filter.options.map((option) => (
                      <CustomCheckbox
                        key={option.value}
                        checked={filter.value === option.value}
                        onChange={() => filter.onChange(option.value)}
                        label={option.label}
                        count={option.count}
                      />
                    ))}
                  </div>
                </FilterSection>
              ))}

              {showCategoryFilter && categoryStats.length > 0 && (
                <FilterSection
                  title={isAzerbaijani ? 'Kateqoriyalar' : 'Categories'}
                  icon="📂"
                >
                  {renderCategoryFilters()}
                </FilterSection>
              )}

              <FilterSection
                title={isAzerbaijani ? 'Qiymət Aralığı' : 'Price Range'}
                icon="💰"
              >
                <PriceRangeSlider
                  priceRange={priceRange}
                  minMaxPrices={minMaxPrices}
                  onPriceChange={handlePriceRangeChange}
                  isAzerbaijani={isAzerbaijani}
                />
              </FilterSection>

              {showStockFilter && (
                <FilterSection
                  title={isAzerbaijani ? 'Stok Vəziyyəti' : 'Stock Status'}
                  icon="📦"
                >
                  {renderStockFilters()}
                </FilterSection>
              )}
            </SmartFilters>

            {error ? (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className={styles.productsGrid}>
                {sortedProducts.map((product) => (
                    <div 
                    key={product.id}
                      className={styles.productCard}
                      onClick={() => handleProductClick(product)}
                      style={{ cursor: product.instock ? 'pointer' : 'not-allowed' }}
                    >
                      <div className={styles.productImageContainer}>
                        {product.isDiscount && (
                          <div className={styles.discountBadge}>
                            -{Math.round(product.discount)}%
                          </div>
                        )}
                        <img
                          src={product.image}
                          alt={isAzerbaijani ? product.nameAz : product.nameEn}
                          className={styles.productImage}
                        />
                      </div>

                      <div className={styles.productInfo}>
                        <h3 className={styles.productName}>
                          {isAzerbaijani ? product.nameAz : product.nameEn}
                        </h3>

                        <div className={styles.productCategory}>
                          <span className={styles.categoryBadge}>
                            {isAzerbaijani ? product.categoryAz || product.main_category : product.categoryEn || product.main_category}
                          </span>
                          {!product.instock && (
                            <span className={`${styles.stockBadge} ${styles.outOfStock}`}>
                              {isAzerbaijani ? 'Stokda yoxdur' : 'Out of Stock'}
                            </span>
                          )}
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
                        <div className={styles.actionButtons}>
                          <button 
                            className={`${styles.viewProductBtn} ${!product.instock ? styles.disabled : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            disabled={!product.instock}
                          >
                            <span className={styles.btnIcon}>👁️</span>
                            {isAzerbaijani ? 'Məhsula bax' : 'View Details'}
                          </button>
                          
                          <div className={styles.cartButtonWrapper}>
                            <button 
                              className={`${styles.addToCartBtn} ${!product.instock ? styles.disabled : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(e, product);
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                              onTouchStart={(e) => e.preventDefault()}
                              disabled={!product.instock}
                            >
                              <span className={styles.btnIcon}>🛒</span>
                              {!product.instock 
                                ? (isAzerbaijani ? 'Stokda yoxdur' : 'Out of Stock')
                                : (isAzerbaijani ? 'Səbətə əlavə et' : 'Add to Cart')
                              }
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className={styles.noProducts}>
                <div className={styles.noProductsIcon}>🔍</div>
                <h3 className={styles.noProductsTitle}>
                  {isAzerbaijani ? 'Məhsul tapılmadı' : 'No Products Found'}
                </h3>
                <p className={styles.noProductsText}>
                  {searchTerm 
                    ? (isAzerbaijani 
                        ? `"${searchTerm}" axtarışına uyğun məhsul tapılmadı`
                        : `No products match your search "${searchTerm}"`
                      )
                    : (isAzerbaijani 
                        ? 'Hazırda məhsul mövcud deyil'
                        : 'No products available at the moment'
                      )
                  }
                </p>
              </div>
            )}
            </div>
        )}
      </div>
      </main>
      <Footer />
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

// ProductCard component to handle individual product rendering
const ProductCard = memo(({ 
  product, 
  isAzerbaijani, 
  isAuthenticated, 
  inWishlist, 
  addWishlistItem, 
  removeWishlistItem, 
  handleProductClick, 
  handleAddToCart 
}) => {
  return (
    <div className={`${styles.productCard} ${product.isDiscount ? styles.discounted : ''}`}>
      <div 
        className={styles.productImageContainer}
        onClick={() => handleProductClick(product)}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={isAzerbaijani ? product.nameAz : product.nameEn}
            className={styles.productImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div className={styles.productImagePlaceholder} style={{ display: product.image ? 'none' : 'flex' }}>
          <span className={styles.placeholderIcon}>📦</span>
        </div>
        
        {product.isDiscount && (
          <div className={styles.discountBadge}>
            <span className={styles.discountIcon}>🏷️</span>
            {isAzerbaijani ? 'ENDİRİM' : 'SALE'}
            <span className={styles.discountPercent}>
              -{Math.round(product.discount)}%
            </span>
          </div>
        )}

        <button
          className={`${styles.wishlistBtn} ${inWishlist(product.id) ? styles.active : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              errorToast(isAzerbaijani ? 'Əvvəlcə daxil olmalısınız' : 'Please login first');
              return;
            }
            if (inWishlist(product.id)) {
              removeWishlistItem(product.id);
              successToast(isAzerbaijani ? 'İstək siyahısından silindi' : 'Removed from wishlist');
            } else {
              addWishlistItem(product);
              successToast(isAzerbaijani ? 'İstək siyahısına əlavə edildi' : 'Added to wishlist');
            }
          }}
        >
          {inWishlist(product.id) ? <BsHeartFill /> : <BsHeart />}
        </button>
      </div>

      <div 
        className={styles.productInfo}
        onClick={() => handleProductClick(product)}
      >
        <h3 className={styles.productName}>
          {isAzerbaijani ? product.nameAz : product.nameEn}
        </h3>

        <div className={styles.productCategory}>
          <span className={styles.categoryBadge}>
            {isAzerbaijani ? product.categoryAz || product.main_category : product.categoryEn || product.main_category}
          </span>
          {!product.instock && (
            <span className={`${styles.stockBadge} ${styles.outOfStock}`}>
              {isAzerbaijani ? 'Stokda yoxdur' : 'Out of Stock'}
            </span>
          )}
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
        <div className={styles.actionButtons}>
          <button 
            className={styles.viewProductBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(product);
            }}
          >
            <span className={styles.btnIcon}>👁️</span>
            {isAzerbaijani ? 'Məhsula bax' : 'View Details'}
          </button>
          
          <div className={styles.cartButtonWrapper}>
            <button 
              className={`${styles.addToCartBtn} ${!product.instock ? styles.disabled : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e, product);
              }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              disabled={!product.instock}
            >
              <span className={styles.btnIcon}>🛒</span>
              {!product.instock 
                ? (isAzerbaijani ? 'Stokda yoxdur' : 'Out of Stock')
                : (isAzerbaijani ? 'Səbətə əlavə et' : 'Add to Cart')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductsTemplate;