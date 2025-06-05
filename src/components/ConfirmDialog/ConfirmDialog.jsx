import React, { useCallback, useMemo } from 'react';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';
import styles from './ConfirmDialog.module.css';

if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useTranslation();

  const handleConfirm = useCallback(() => {
    onClose(); // Close dialog immediately
    // Only call onConfirm after dialog is closed
    setTimeout(() => {
      if (onConfirm) {
        onConfirm();
      }
    }, 0);
  }, [onConfirm, onClose]);

  const modalProps = useMemo(() => ({
    isOpen,
    onRequestClose: onClose,
    className: styles.modal,
    overlayClassName: styles.overlay,
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEsc: true,
    preventScroll: true,
    ariaHideApp: true
  }), [isOpen, onClose]);

  return (
    <Modal {...modalProps}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
            type="button"
          >
            {t('common.no')}
          </button>
          <button
            className={`${styles.button} ${styles.confirmButton}`}
            onClick={handleConfirm}
            type="button"
          >
            {t('common.yes')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ConfirmDialog, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.title === nextProps.title &&
    prevProps.message === nextProps.message
  );
}); 