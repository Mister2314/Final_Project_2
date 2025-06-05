import { toast } from 'react-hot-toast';
import i18next from 'i18next';

export const showToast = (type, messageKey, options = {}) => {
  const { t } = i18next;
  
  let message = t(`toast.${type}.${messageKey}`);
  
  if (message === `toast.${type}.${messageKey}`) {
    message = t(messageKey);
  }

  if (message === messageKey) {
    console.warn(`Translation missing for key: ${messageKey}`);
  }

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.error(message, options);
      break;
    case 'info':
      toast.loading(message, options);
      break;
    default:
      toast(message, options);
  }
};

export const successToast = (messageKey, options = {}) => showToast('success', messageKey, options);
export const errorToast = (messageKey, options = {}) => showToast('error', messageKey, options);
export const warningToast = (messageKey, options = {}) => showToast('warning', messageKey, options);
export const infoToast = (messageKey, options = {}) => showToast('info', messageKey, options); 