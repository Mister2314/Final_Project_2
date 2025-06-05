import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const useConfirmDialog = () => {
  const { t } = useTranslation();
  const isProcessingRef = useRef(false);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isProcessing: false
  });

  const openDialog = useCallback(({ title, message, onConfirm }) => {
    if (dialogState.isOpen || isProcessingRef.current) {
      return;
    }

    const translatedTitle = title.startsWith('common.') || title.startsWith('dialog.') ? t(title) : title;
    const translatedMessage = message.startsWith('common.') || message.startsWith('dialog.') ? t(message) : message;

    setDialogState({
      isOpen: true,
      title: translatedTitle,
      message: translatedMessage,
      onConfirm,
      isProcessing: false
    });
  }, [dialogState.isOpen, t]);

  const closeDialog = useCallback(() => {
    if (!dialogState.isOpen) return;

    setDialogState(prev => ({
      ...prev,
      isOpen: false,
      isProcessing: false
    }));
    isProcessingRef.current = false;
  }, [dialogState.isOpen]);

  const handleConfirm = useCallback(async () => {
    if (!dialogState.onConfirm || isProcessingRef.current) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setDialogState(prev => ({ ...prev, isProcessing: true }));
      await dialogState.onConfirm();
    } finally {
      closeDialog();
    }
  }, [dialogState.onConfirm, closeDialog]);

  return {
    dialogState: {
      ...dialogState,
      onConfirm: handleConfirm,
      closeDialog
    },
    openDialog,
    closeDialog
  };
};

export default useConfirmDialog; 