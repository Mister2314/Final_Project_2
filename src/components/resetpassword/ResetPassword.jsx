import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import styles from './ResetPassword.module.css'; // Using the same styles as ForgotPassword

export default function ResetPassword() {
  const { t } = useTranslation();
  const { updatePassword, loading } = useUser();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if we have valid reset token parameters
  useEffect(() => {
    const checkToken = () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        setIsValidToken(true);
        // Set the session with the tokens
        import('../../SupabaseClient').then(({ supabase }) => {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
        });
      } else {
        setIsValidToken(false);
        toast.error(t('resetPassword.invalidToken'));
        setTimeout(() => navigate('/forgot-password'), 3000);
      }
      setIsCheckingToken(false);
    };
    
    checkToken();
  }, [searchParams, navigate, t]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error(t('resetPassword.errorPassword'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('resetPassword.errorPasswordLength'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('resetPassword.errorPasswordMismatch'));
      return;
    }
    
    const result = await updatePassword(password);
    
    if (result.success) {
      toast.success(t('resetPassword.successMessage'));
      setTimeout(() => navigate('/login'), 2000);
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
          <p className={styles.description}>{t('resetPassword.verifying')}</p>
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
          <h2 className={styles.loginTitle}>{t('resetPassword.invalidTokenTitle')}</h2>
          <p className={styles.description}>
            {t('resetPassword.invalidTokenDescription')}
          </p>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/forgot-password')}
          >
            {t('resetPassword.requestNewLink')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>{t('resetPassword.title')}</h2>
        <p className={styles.description}>
          {t('resetPassword.description')}
        </p>
        
        <form className={styles.loginForm} onSubmit={handleResetPassword}>
          <div className={styles.formGroup}>
            <label>{t('resetPassword.newPassword')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('resetPassword.newPasswordPlaceholder')}
              required
              minLength={8}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>{t('resetPassword.confirmPassword')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
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
              t('resetPassword.updateButton')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('resetPassword.rememberPassword')} 
          <button 
            className={styles.authLink}
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('resetPassword.loginLink')}
          </button>
        </div>
      </div>
    </div>
  );
}