import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import styles from './HeroSection.module.css';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useTranslation();

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1630879543794-b5341dc02d99?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      petType: "dog",
      titleKey: "heroSection.slides.0.title",
      descriptionKey: "heroSection.slides.0.description",
      buttonTextKey: "heroSection.slides.0.buttonText",
      buttonLink: "/shop"
    },
    {
      image: "https://images.unsplash.com/photo-1717657742213-966ebc2252c0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      petType: "cat",
      titleKey: "heroSection.slides.1.title",
      descriptionKey: "heroSection.slides.1.description",
      buttonTextKey: "heroSection.slides.1.buttonText",
      buttonLink: "/shop/cats"
    },
    {
      image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      petType: "both",
      titleKey: "heroSection.slides.2.title",
      descriptionKey: "heroSection.slides.2.description",
      buttonTextKey: "heroSection.slides.2.buttonText",
      buttonLink: "/shop"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isAnimating, heroSlides.length]);

  const handleSlideChange = (index) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        {heroSlides.map((slide, index) => (
          <div 
            key={index} 
            className={`${styles.heroSlide} ${currentSlide === index ? styles.active : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={styles.overlay}></div>
            <div className={styles.heroContent}>
              <div className={styles.textContent}>
                <motion.h1 
                  className={styles.heroTitle}
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {t(slide.titleKey)}
                </motion.h1>
                
                <motion.p 
                  className={styles.heroDescription}
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {t(slide.descriptionKey)}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link to={slide.buttonLink} className={styles.heroButton}>
                    <span>{t(slide.buttonTextKey)}</span>
                    <FaArrowRight className={styles.buttonIcon} />
                  </Link>
                </motion.div>
              </div>
              
              <motion.div 
                className={styles.decorElement}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={currentSlide === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
              </motion.div>
            </div>
          </div>
        ))}
        
        <div className={styles.floatingPaws}>
          {[...Array(8)].map((_, i) => (
            <span 
              key={i} 
              className={styles.floatingPaw}
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 90 + 5}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 15}s`
              }}
            >
              <FaPaw />
            </span>
          ))}
        </div>
        
        <div className={styles.dotsContainer}>
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${currentSlide === index ? styles.activeDot : ''}`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;