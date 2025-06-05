import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ShoppingBag, Heart } from "lucide-react";
import styles from './NotFound.module.css';

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [petMood, setPetMood] = useState("idle");
  const [clicks, setClicks] = useState(0);

  const handlePetClick = useCallback(() => {
    setClicks(prev => prev + 1);
    setPetMood("happy");
    setTimeout(() => setPetMood("idle"), 2000);
  }, []);

  const handleHomeClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleShopClick = useCallback(() => {
    navigate("/shop");
  }, [navigate]);

  const petEmoji = useMemo(() => {
    switch (petMood) {
      case "happy": return "😻";
      case "playing": return "🐱";
      default: return "😸";
    }
  }, [petMood]);

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.glassCard}>
          
          <div className={styles.errorDisplay}>
            <span className={styles.errorNumber}>
              4
            </span>
            
            <div
              className={styles.petContainer}
              onClick={handlePetClick}
            >
              <div className={styles.petEmoji}>
                {petEmoji}
              </div>
              
              {petMood === "happy" && (
                <div className={styles.petSpeech}>
                  {t("notFound.speechBubbleHappy")}
                </div>
              )}
              
              {clicks > 0 && clicks % 3 === 0 && (
                <div className={styles.heartContainer}>
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={`${clicks}-${i}`}
                      className={styles.floatingHeart}
                      style={{
                        left: `${20 + i * 20}%`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <span className={`${styles.errorNumber} ${styles.errorNumberDelay}`}>
              4
            </span>
          </div>
          
          <div className={styles.contentSection}>
            <h1 className={styles.title}>
              {t("notFound.title")}
            </h1>
            
            <p className={styles.description}>
              {t("notFound.description")}
            </p>
            
            {clicks === 0 && (
              <p className={styles.interactionHint}>
                {t("notFound.petInteraction")}
              </p>
            )}
          </div>
          
          <div className={styles.buttonContainer}>
            <button className={styles.primaryButton} onClick={handleHomeClick}>
              <Home className={styles.buttonIcon} />
              {t("notFound.goHome")}
            </button>
            
            <button className={styles.secondaryButton} onClick={handleShopClick}>
              <ShoppingBag className={styles.buttonIcon} />
              {t("notFound.goShop")}
            </button>
          </div>
          
        
          
        </div>
      </div>
    </div>
  );
};

export default NotFound;