import React from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import styles from './ProductDetails.module.css';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isAzerbaijani
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={isAzerbaijani ? "Əvvəlki səhifə" : "Previous page"}
      >
        <BsChevronLeft />
      </button>

      {getPageNumbers().map((pageNumber, index) => (
        <button
          key={index}
          className={`${styles.pageButton} ${pageNumber === currentPage ? styles.active : ''}`}
          onClick={() => typeof pageNumber === 'number' ? onPageChange(pageNumber) : null}
          disabled={typeof pageNumber !== 'number'}
        >
          {pageNumber}
        </button>
      ))}

      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={isAzerbaijani ? "Növbəti səhifə" : "Next page"}
      >
        <BsChevronRight />
      </button>
    </div>
  );
};

export default Pagination; 