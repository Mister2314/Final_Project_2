import React, { useEffect, useState } from "react";
import { FaPaw } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import styles from "./LoadingScreen.module.css";

const LoadingScreen = () => {
  const { theme } = useTheme();
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  useEffect(() => {
    if (document.readyState === 'complete') {
      handlePageLoaded();
    } else {
      window.addEventListener('load', handlePageLoaded);
            const backupTimer = setTimeout(handlePageLoaded, 5000);
      return () => {
        window.removeEventListener('load', handlePageLoaded);
        clearTimeout(backupTimer);
      };
    }
  }, []);
  
  const handlePageLoaded = () => {
    setFadeOut(true);
    const timer = setTimeout(() => {
      setHidden(true);
    }, 600);
    
    return () => clearTimeout(timer);
  };
  
  if (hidden) return null;
  
  return (
    <div className={`${styles.loadingScreen} ${fadeOut ? styles.fadeOut : ""}`}>
      <div className={styles.contentContainer}>
        <FaPaw className={styles.mainPaw} />
  
        <h1 className={styles.brandName}>Pawsome</h1>
                <div className={styles.pawTrail}>
          <div className={`${styles.pawPrint} ${styles.pawPrint1}`}>
            <FaPaw />
          </div>
          <div className={`${styles.pawPrint} ${styles.pawPrint2}`}>
            <FaPaw />
          </div>
          <div className={`${styles.pawPrint} ${styles.pawPrint3}`}>
            <FaPaw />
          </div>
          <div className={`${styles.pawPrint} ${styles.pawPrint4}`}>
            <FaPaw />
          </div>
          <div className={`${styles.pawPrint} ${styles.pawPrint5}`}>
            <FaPaw />
          </div>
        </div>
        
        <p className={styles.loadingText}>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;