import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/Spinner/Spinner'; 
import styles from './Faq.module.css';

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

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

  const getAllFAQs = () => {
    const faqData = getFAQData();
    return Object.values(faqData).flat();
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
                const allFAQs = getAllFAQs();
        setFilteredFAQs(allFAQs);
        setDataInitialized(true);
      } catch (error) {
        // console.error("Error initializing FAQ data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [t, i18n.language]); 

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
  }, [activeCategory, searchTerm, dataInitialized, t, i18n.language]); 

  const categories = [
    { id: 'all', name: t('faq.categories.all') },
    { id: 'orders', name: t('faq.categories.orders') },
    { id: 'shipping', name: t('faq.categories.shipping') },
    { id: 'products', name: t('faq.categories.products') },
    { id: 'returns', name: t('faq.categories.returns') },
  ];

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setExpandedItems({});
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setExpandedItems({});
  };

  const clearSearch = () => {
    setSearchTerm('');
    setExpandedItems({});
  };

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
        
        <div className={styles.pawPrints}>
          <span className={`${styles.pawPrint} ${styles.paw1}`}>🐾</span>
          <span className={`${styles.pawPrint} ${styles.paw2}`}>🐾</span>
          <span className={`${styles.pawPrint} ${styles.paw3}`}>🐾</span>
        </div>
      </div>
      
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
      
      <div className={styles.faqItemsContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Spinner size="medium" />
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

export default FAQ