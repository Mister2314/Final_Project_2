import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const activeToasts = new Set();
const toastTimeouts = new Map();

export const useToast = () => {
  const { t } = useTranslation();

  const clearToastTimeout = useCallback((id) => {
    const timeout = toastTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeouts.delete(id);
    }
  }, []);

  const showToast = useCallback((message, type = 'default', options = {}) => {
    const id = options.id || `${type}-${message}-${Date.now()}`;
    if (activeToasts.has(id)) {
      return;
    }

    const translatedMessage = message.startsWith('common.') || message.startsWith('toast.') 
      ? t(message) 
      : message;

    clearToastTimeout(id);
    activeToasts.add(id);
    const toastOptions = {
      ...options,
      id,
      duration: options.duration || 3000,
      onClose: () => {
        activeToasts.delete(id);
        clearToastTimeout(id);
        options.onClose?.();
      },
    };

    const timeout = setTimeout(() => {
      activeToasts.delete(id);
      toastTimeouts.delete(id);
    }, toastOptions.duration + 1000); 

    toastTimeouts.set(id, timeout);

    switch (type) {
      case 'success':
        return toast.success(translatedMessage, toastOptions);
      case 'error':
        return toast.error(translatedMessage, toastOptions);
      case 'loading':
        return toast.loading(translatedMessage, toastOptions);
      default:
        return toast(translatedMessage, toastOptions);
    }
  }, [t, clearToastTimeout]);

  const success = useCallback((message, options = {}) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast(message, 'error', options);
  }, [showToast]);

  const loading = useCallback((message, options = {}) => {
    return showToast(message, 'loading', options);
  }, [showToast]);

  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
    activeToasts.delete(toastId);
    clearToastTimeout(toastId);
  }, [clearToastTimeout]);

  return {
    showToast,
    success,
    error,
    loading,
    dismiss
  };
}; 