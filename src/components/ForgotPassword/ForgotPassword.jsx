import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { forgotPassword, loading } = useUser();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('forgotPassword.errorEmail', 'Please enter your email address'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('forgotPassword.errorEmailFormat', 'Please enter a valid email address'));
      return;
    }
    
    const result = await forgotPassword(email);
    
    if (result.success) {
      setEmailSent(true);
      toast.success(t('forgotPassword.successMessage', 'Password reset email sent!'));
    } else {
      toast.error(result.error || t('forgotPassword.errorGeneric', 'Failed to send reset email'));
    }
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
            {t('forgotPassword.emailSentTitle', 'Check Your Email')}
          </h2>
          <p className={styles.description}>
            {t('forgotPassword.emailSentDescription', 'We\'ve sent a password reset link to your email address. Please check your inbox and click the link to reset your password.')}
          </p>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/login')}
          >
            {t('forgotPassword.backToLogin', 'Back to Login')}
          </button>
          <div className={styles.authSwitch}>
            {t('forgotPassword.didntReceive', 'Didn\'t receive the email?')} 
            <button 
              className={styles.authLink}
              onClick={() => setEmailSent(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('forgotPassword.tryAgain', 'Try again')}
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
          {t('forgotPassword.title', 'Forgot Password')}
        </h2>
        <p className={styles.description}>
          {t('forgotPassword.description', 'Enter your email address and we\'ll send you a link to reset your password.')}
        </p>
        
        <form className={styles.loginForm} onSubmit={handleForgotPassword}>
          <div className={styles.formGroup}>
            <label>{t('forgotPassword.emailLabel', 'Email Address')}</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('forgotPassword.emailPlaceholder', 'Enter your email address')}
              required
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
              t('forgotPassword.sendButton', 'Send Reset Link')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('forgotPassword.rememberPassword', 'Remember your password?')} 
          <button 
            className={styles.authLink}
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('forgotPassword.loginLink', 'Sign in')}
          </button>
        </div>
      </div>
    </div>
  );
}