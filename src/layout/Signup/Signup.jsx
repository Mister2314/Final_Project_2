import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import styles from './Signup.module.css';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function SignUp() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  const previousPath = location.state?.from || '/';
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error(t('signup.errorFields'));
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await register({
        email,
        password,
        fullName: username
      });
      
      if (success) {
        navigate('/login', { 
          state: { 
            from: '/',
            newUser: true,
            email: email 
          } 
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackButton = () => {
    if (previousPath === '/login') {
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
        <h2 className={styles.loginTitle}>{t('signup.title')}</h2>
        <form className={styles.loginForm} onSubmit={handleSignUp}>
          <div className={styles.formGroup}>
            <label>{t('signup.username')}</label>
            <input
              className={styles.formInput}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('signup.usernamePlaceholder')}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t('signup.email')}</label>
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('signup.emailPlaceholder')}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t('signup.password')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('signup.passwordPlaceholder')}
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
              t('signup.signupButton')
            )}
          </button>
        </form>
        <div className={styles.authSwitch}>
          {t('signup.haveAccount')} <Link to="/login" state={{ from: previousPath !== '/login' ? previousPath : '/' }} className={styles.authLink}>{t('signup.loginLink')}</Link>
        </div>
      </div>
    </div>
  );
}