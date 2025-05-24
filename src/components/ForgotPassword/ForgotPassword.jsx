import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { forgotPassword, loading, showNotificationOnce, clearNotificationCache } = useUser();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!email.trim()) {
        showNotificationOnce(t('forgotPassword.errorEmail', 'Email ünvanınızı daxil edin'));
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotificationOnce(t('forgotPassword.errorEmailFormat', 'Düzgün email ünvanı daxil edin'));
        return;
      }
      
      const result = await forgotPassword(email);
      
      if (result.success) {
        setEmailSent(true);
        showNotificationOnce(t('forgotPassword.successMessage', 'Parol bərpası üçün email göndərildi!'), 'success');
      } else {
        showNotificationOnce(result.error || t('forgotPassword.errorGeneric', 'Email göndərilməsində xəta baş verdi'));
      }
    } catch (error) {
      showNotificationOnce(t('forgotPassword.errorGeneric', 'Email göndərilməsində xəta baş verdi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear cache when user types
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    clearNotificationCache(); // Clear cache on input change
  };

  // Clear cache when trying again
  const handleTryAgain = () => {
    setEmailSent(false);
    clearNotificationCache();
  };

  if (emailSent) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
              <path d="m9 12 2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.loginTitle}>
            {t('forgotPassword.emailSentTitle', 'Email-inizi yoxlayın')}
          </h2>
          <p className={styles.description}>
            {t('forgotPassword.emailSentDescription', 'Parol bərpası linki email ünvanınıza göndərildi. Zəhmət olmasa email-inizi yoxlayın və linki kliklə.')}
          </p>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/login')}
          >
            {t('forgotPassword.backToLogin', 'Girişə qayıt')}
          </button>
          <div className={styles.authSwitch}>
            {t('forgotPassword.rememberPassword', 'Parolunuzu xatırlayırsınız?')} 
            <button 
              className={styles.authLink}
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('forgotPassword.loginLink', 'Daxil ol')}
            </button>
          </div>
          <div className={styles.authSwitch}>
            {t('forgotPassword.didntReceive', 'Email almadınız?')} 
            <button 
              className={styles.authLink}
              onClick={handleTryAgain}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('forgotPassword.tryAgain', 'Yenidən cəhd edin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>
          {t('forgotPassword.title', 'Parolu Unutmusunuz?')}
        </h2>
        <p className={styles.description}>
          {t('forgotPassword.description', 'Email ünvanınızı daxil edin və sizə parol bərpası linki göndərəcəyik.')}
        </p>
        
        <form className={styles.loginForm} onSubmit={handleForgotPassword}>
          <div className={styles.formGroup}>
            <label>{t('forgotPassword.emailLabel', 'Email Ünvanı')}</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={t('forgotPassword.emailPlaceholder', 'Email ünvanınızı daxil edin')}
              required
              disabled={loading || isSubmitting}
            />
          </div>
          
          <button 
            className={styles.loginButton} 
            type="submit" 
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) ? (
              <div className={styles.pawLoaderContainer}>
                <div className={styles.pawLoader}>
                  <div className={styles.pawPrint}></div>
                  <div className={styles.pawPrint}></div>
                  <div className={styles.pawPrint}></div>
                  <div className={styles.pawPrint}></div>
                  <div className={styles.pawPrint}></div>
                </div>
              </div>
            ) : (
              t('forgotPassword.sendButton', 'Bərpa Linki Göndər')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('forgotPassword.rememberPassword', 'Parolunuzu xatırlayırsınız?')} 
          <button 
            className={styles.authLink}
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('forgotPassword.loginLink', 'Daxil ol')}
          </button>
        </div>
      </div>
    </div>
  );
}