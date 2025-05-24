import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../SupabaseClient';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { updatePassword, loading, showNotificationOnce, clearNotificationCache } = useUser();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check and handle reset token
  useEffect(() => {
    const handleResetToken = async () => {
      try {
        // Check URL parameters first
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        // Check hash parameters as backup
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');
        
        const finalAccessToken = accessToken || hashAccessToken;
        const finalRefreshToken = refreshToken || hashRefreshToken;
        const finalType = type || hashType;
        
        if (finalAccessToken && finalRefreshToken && finalType === 'recovery') {
          try {
            // Set the session with the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: finalAccessToken,
              refresh_token: finalRefreshToken
            });
            
            if (error) {
              console.error('Session error:', error);
              setTokenError(t('resetPassword.invalidToken', 'Bərpa linki yanlış və ya vaxtı keçib'));
              setIsValidToken(false);
            } else {
              console.log('Session set successfully:', data);
              setIsValidToken(true);
            }
          } catch (sessionError) {
            console.error('Session setting failed:', sessionError);
            setTokenError(t('resetPassword.invalidToken', 'Bərpa linki yanlış və ya vaxtı keçib'));
            setIsValidToken(false);
          }
        } else {
          setTokenError(t('resetPassword.invalidToken', 'Bərpa linki yanlış və ya vaxtı keçib'));
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('Token handling error:', error);
        setTokenError(t('resetPassword.invalidToken', 'Bərpa linki yanlış və ya vaxtı keçib'));
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };
    
    // Small delay to ensure everything is loaded
    const timer = setTimeout(handleResetToken, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams, t]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!password.trim()) {
        showNotificationOnce(t('resetPassword.errorPassword', 'Parol daxil edin'));
        return;
      }

      if (password.length < 8) {
        showNotificationOnce(t('resetPassword.errorPasswordLength', 'Parol ən az 8 simvoldan ibarət olmalıdır'));
        return;
      }

      if (password !== confirmPassword) {
        showNotificationOnce(t('resetPassword.errorPasswordMismatch', 'Parollar uyğun gəlmir'));
        return;
      }
      
      const result = await updatePassword(password);
      
      if (result.success) {
        showNotificationOnce(t('resetPassword.successMessage', 'Parol uğurla yeniləndi!'), 'success');
        // Clear the hash to prevent reuse
        window.location.hash = '';
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showNotificationOnce(result.error || t('resetPassword.errorGeneric', 'Parol yenilənməsində xəta baş verdi'));
      }
    } catch (error) {
      showNotificationOnce(t('resetPassword.errorGeneric', 'Parol yenilənməsində xəta baş verdi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear cache when user types
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    clearNotificationCache();
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    clearNotificationCache();
  };

  // Loading state while checking token
  if (isCheckingToken) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.pawLoaderContainer}>
            <div className={styles.pawLoader}>
              <div className={styles.pawPrint}></div>
              <div className={styles.pawPrint}></div>
              <div className={styles.pawPrint}></div>
              <div className={styles.pawPrint}></div>
              <div className={styles.pawPrint}></div>
            </div>
          </div>
          <p className={styles.description}>
            {t('resetPassword.verifying', 'Bərpa linki yoxlanılır...')}
          </p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.errorIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
              <path d="m15 9-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m9 9 6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.loginTitle}>
            {t('resetPassword.invalidTokenTitle', 'Yanlış Bərpa Linki')}
          </h2>
          <p className={styles.description}>
            {tokenError || t('resetPassword.invalidTokenDescription', 'Bu parol bərpası linki yanlışdır və ya vaxtı keçib. Yeni link tələb edin.')}
          </p>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/forgot-password')}
          >
            {t('resetPassword.requestNewLink', 'Yeni Bərpa Linki Tələb Et')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>
          {t('resetPassword.title', 'Parolunuzu Yeniləyin')}
        </h2>
        <p className={styles.description}>
          {t('resetPassword.description', 'Aşağıya yeni parolunuzu daxil edin.')}
        </p>
        
        <form className={styles.loginForm} onSubmit={handleResetPassword}>
          <div className={styles.formGroup}>
            <label>{t('resetPassword.newPassword', 'Yeni Parol')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder={t('resetPassword.newPasswordPlaceholder', 'Yeni parol daxil edin')}
              required
              minLength={8}
              disabled={loading || isSubmitting}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>{t('resetPassword.confirmPassword', 'Parol Təkrarı')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder={t('resetPassword.confirmPasswordPlaceholder', 'Yeni parolu təkrar edin')}
              required
              minLength={8}
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
              t('resetPassword.updateButton', 'Parolu Yenilə')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('resetPassword.rememberPassword', 'Parolunuzu xatırlayırsınız?')} 
          <button 
            className={styles.authLink}
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('resetPassword.loginLink', 'Daxil ol')}
          </button>
        </div>
      </div>
    </div>
  );
}