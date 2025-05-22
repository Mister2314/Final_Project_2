import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { resetPassword, loading } = useUser();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(t('forgotPassword.errorEmail'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('forgotPassword.errorEmailValid'));
      return;
    }

    const result = await resetPassword(email);
    
    if (result.success) {
      setEmailSent(true);
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
          <h2 className={styles.loginTitle}>{t('forgotPassword.emailSentTitle')}</h2>
          <p className={styles.description}>
            {t('forgotPassword.emailSentDescription', { email })}
          </p>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/login')}
          >
            {t('forgotPassword.backToLogin')}
          </button>
          <div className={styles.authSwitch}>
            {t('forgotPassword.didntReceive')} 
            <button 
              className={styles.authLink}
              onClick={() => setEmailSent(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('forgotPassword.resendLink')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>{t('forgotPassword.title')}</h2>
        <p className={styles.description}>
          {t('forgotPassword.description')}
        </p>
        
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>{t('forgotPassword.emailLabel')}</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('forgotPassword.emailPlaceholder')}
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
              t('forgotPassword.sendButton')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('forgotPassword.rememberPassword')} 
          <button 
            className={styles.authLink}
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('forgotPassword.loginLink')}
          </button>
        </div>
      </div>
    </div>
  );
}