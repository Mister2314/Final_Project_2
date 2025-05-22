import React from 'react';
import styles from './Spinner.module.css';

const Spinner = ({ size = 'medium' }) => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}></div>
      </div>
    </div>
  );
};

export default Spinner;