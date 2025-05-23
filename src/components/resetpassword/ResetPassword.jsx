import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../SupabaseClient';
import toast from 'react-hot-toast';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { updatePassword, loading } = useUser();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');
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
              setTokenError(t('resetPassword.invalidToken', 'Invalid or expired reset link'));
              setIsValidToken(false);
            } else {
              console.log('Session set successfully:', data);
              setIsValidToken(true);
            }
          } catch (sessionError) {
            console.error('Session setting failed:', sessionError);
            setTokenError(t('resetPassword.invalidToken', 'Invalid or expired reset link'));
            setIsValidToken(false);
          }
        } else {
          setTokenError(t('resetPassword.invalidToken', 'Invalid or expired reset link'));
          setIsValidToken(false);
        }
      } catch (error) {
        console.error('Token handling error:', error);
        setTokenError(t('resetPassword.invalidToken', 'Invalid or expired reset link'));
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
    
    if (!password.trim()) {
      toast.error(t('resetPassword.errorPassword', 'Please enter a password'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('resetPassword.errorPasswordLength', 'Password must be at least 8 characters'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('resetPassword.errorPasswordMismatch', 'Passwords do not match'));
      return;
    }
    
    const result = await updatePassword(password);
    
    if (result.success) {
      toast.success(t('resetPassword.successMessage', 'Password updated successfully!'));
      // Clear the hash to prevent reuse
      window.location.hash = '';
      setTimeout(() => navigate('/login'), 2000);
    } else {
      toast.error(result.error || t('resetPassword.errorGeneric', 'Failed to update password'));
    }
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
            {t('resetPassword.verifying', 'Verifying reset link...')}
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
            {t('resetPassword.invalidTokenTitle', 'Invalid Reset Link')}
          </h2>
          <p className={styles.description}>
            {tokenError || t('resetPassword.invalidTokenDescription', 'This password reset link is invalid or has expired. Please request a new one.')}
          </p>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/forgot-password')}
          >
            {t('resetPassword.requestNewLink', 'Request New Reset Link')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>
          {t('resetPassword.title', 'Reset Your Password')}
        </h2>
        <p className={styles.description}>
          {t('resetPassword.description', 'Enter your new password below.')}
        </p>
        
        <form className={styles.loginForm} onSubmit={handleResetPassword}>
          <div className={styles.formGroup}>
            <label>{t('resetPassword.newPassword', 'New Password')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('resetPassword.newPasswordPlaceholder', 'Enter new password')}
              required
              minLength={8}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>{t('resetPassword.confirmPassword', 'Confirm Password')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('resetPassword.confirmPasswordPlaceholder', 'Confirm new password')}
              required
              minLength={8}
            />
          </div>
          
          <button className={styles.loginButton} type="submit" disabled={loading}>
            {loading ? (
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
              t('resetPassword.updateButton', 'Update Password')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('resetPassword.rememberPassword', 'Remember your password?')} 
          <button 
            className={styles.authLink}
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('resetPassword.loginLink', 'Sign in')}
          </button>
        </div>
      </div>
    </div>
  );
}