import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Faq.module.css';

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Get translated FAQ data organized by categories
  const getFAQData = () => {
    return {
      orders: [
        {
          id: 'orderTracking',
          question: t('faq.questions.orderTracking'),
          answer: t('faq.answers.orderTracking')
        },
        {
          id: 'orderCancellation',
          question: t('faq.questions.orderCancellation'),
          answer: t('faq.answers.orderCancellation')
        }
      ],
      shipping: [
        {
          id: 'deliveryTime',
          question: t('faq.questions.deliveryTime'),
          answer: t('faq.answers.deliveryTime')
        },
        {
          id: 'internationalShipping',
          question: t('faq.questions.internationalShipping'),
          answer: t('faq.answers.internationalShipping')
        }
      ],
      products: [
        {
          id: 'productQuality',
          question: t('faq.questions.productQuality'),
          answer: t('faq.answers.productQuality')
        },
        {
          id: 'petFoodIngredients',
          question: t('faq.questions.petFoodIngredients'),
          answer: t('faq.answers.petFoodIngredients')
        }
      ],
      returns: [
        {
          id: 'returnPolicy',
          question: t('faq.questions.returnPolicy'),
          answer: t('faq.answers.returnPolicy')
        },
        {
          id: 'damagedProducts',
          question: t('faq.questions.damagedProducts'),
          answer: t('faq.answers.damagedProducts')
        }
      ],
    };
  };

  // Function to get all FAQs from all categories
  const getAllFAQs = () => {
    const faqData = getFAQData();
    return Object.values(faqData).flat();
  };

  // Initialize data on component mount or language change
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this might be an API call
        // For this example, we're just using a timeout to simulate loading
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Set the initial data
        const allFAQs = getAllFAQs();
        setFilteredFAQs(allFAQs);
        setDataInitialized(true);
      } catch (error) {
        console.error("Error initializing FAQ data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [t, i18n.language]); // Re-run when language (t or i18n.language) changes

  // Filter FAQs based on active category and search term
  useEffect(() => {
    if (!dataInitialized) return;
    
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      let results = [];
      const faqData = getFAQData();
      
      if (activeCategory === 'all') {
        results = getAllFAQs();
      } else {
        results = faqData[activeCategory] || [];
      }
      
      // Apply search filter if there's a search term
      if (searchTerm) {
        results = results.filter(faq => 
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredFAQs(results);
      setIsLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [activeCategory, searchTerm, dataInitialized, t, i18n.language]); // Add i18n.language dependency

  // Define categories using translations
  const categories = [
    { id: 'all', name: t('faq.categories.all') },
    { id: 'orders', name: t('faq.categories.orders') },
    { id: 'shipping', name: t('faq.categories.shipping') },
    { id: 'products', name: t('faq.categories.products') },
    { id: 'returns', name: t('faq.categories.returns') },
  ];

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    // Reset expanded items when category changes
    setExpandedItems({});
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset expanded items when search changes
    setExpandedItems({});
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm('');
    // Reset expanded items when search is cleared
    setExpandedItems({});
  };

  // Toggle FAQ item (expand/collapse) with animation
  const toggleFAQ = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className={styles.faqContainer}>
      <div className={styles.faqHeader}>
        <div className={styles.faqHeaderContent}>
          <div className={styles.faqTitle}>
            <span className={styles.pawIcon}>🐾</span>
            <h1>{t('faq.title')}</h1>
          </div>
          <p className={styles.faqSubtitle}>{t('faq.subtitle')}</p>
          
          {/* Search box with icon and clear button */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t('faq.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative paw prints */}
        <div className={styles.pawPrints}>
          <span className={`${styles.pawPrint} ${styles.paw1}`}>🐾</span>
          <span className={`${styles.pawPrint} ${styles.paw2}`}>🐾</span>
          <span className={`${styles.pawPrint} ${styles.paw3}`}>🐾</span>
        </div>
      </div>
      
      {/* Categories */}
      <div className={styles.faqCategoriesWrapper}>
        <div className={styles.faqCategories}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${activeCategory === category.id ? styles.activeCategory : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* FAQ Items with animated dropdown */}
      <div className={styles.faqItemsContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <p>{t('common.loading') || 'Loading...'}</p>
          </div>
        ) : filteredFAQs.length > 0 ? (
          <div className={styles.faqItems}>
            {filteredFAQs.map(faq => (
              <div 
                key={faq.id} 
                className={`${styles.faqItem} ${expandedItems[faq.id] ? styles.expanded : ''}`}
              >
                <div 
                  className={styles.faqQuestion}
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <h3>{faq.question}</h3>
                  <span className={styles.faqIcon}>
                    {expandedItems[faq.id] ? '−' : '+'}
                  </span>
                </div>
                
                {/* Animated dropdown answer container */}
                <div 
                  className={styles.faqAnswerWrapper}
                  style={{
                    maxHeight: expandedItems[faq.id] ? '1000px' : '0',
                    opacity: expandedItems[faq.id] ? 1 : 0,
                    transition: expandedItems[faq.id] 
                      ? 'max-height 0.5s ease-in-out, opacity 0.3s ease-in-out 0.1s' 
                      : 'max-height 0.5s ease-in-out, opacity 0.3s ease-in-out'
                  }}
                >
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🔍</span>
            <h3>{t('faq.noResultsTitle') || t('faq.noResults')}</h3>
            <p>{t('faq.noResultsText') || t('faq.tryDifferent')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQ;