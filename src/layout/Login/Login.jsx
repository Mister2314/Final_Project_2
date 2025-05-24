import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import styles from './Login.module.css';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = location.state?.from || '/';
  const newUser = location.state?.newUser || false;
  const registeredEmail = location.state?.email || '';
  
  useEffect(() => {
    if (newUser && registeredEmail) {
      setEmail(registeredEmail);
      // Bu toast-u daha spesifik et və yalnız bu vəziyyətdə göstər
      toast.success(t('signup.pleaseLogin'));
    }
  }, [newUser, registeredEmail, t]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error(t('login.errorFields'));
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login({ email, password });
      
      if (success) {
        // UserContext-də artıq success notification göstərilir
        // Burada əlavə toast göstərmə
        navigate('/');
      } else {
        // Login uğursuz olsa, UserContext-də error handle olunur
        // Əlavə error toast göstərməyə ehtiyac yoxdur
        console.log('Login failed - error handled in UserContext');
      }
    } catch (error) {
      console.error('Login error details:', error);
      // Əlavə error handling - yalnız gözlənilməz error-lar üçün
      toast.error(t('login.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackButton = () => {
    if (previousPath === '/signup') {
      navigate('/');
    } else {
      navigate(previousPath);
    }
  };
  
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={handleBackButton}>
            <span className={styles.backIcon}>&#8592;</span>
            <span>{t('signup.back')}</span>
          </button>
        </div>
        <h2 className={styles.loginTitle}>{t('login.title')}</h2>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>{t('login.email')}</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t('login.password')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              required
            />
          </div>
          <div className={styles.forgotPassword}>
            <Link to="/forgot-password">{t('login.forgotPassword')}</Link>
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
              t('login.loginButton')
            )}
          </button>
        </form>
        <div className={styles.authSwitch}>
          {t('login.noAccount')} <Link to="/signup" state={{ from: previousPath !== '/signup' ? previousPath : '/' }} className={styles.authLink}>{t('login.signupLink')}</Link>
        </div>
      </div>
    </div>
  );
}