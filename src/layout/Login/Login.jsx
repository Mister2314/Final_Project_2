import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/userSlice';
import { PiEyeBold, PiEyeClosedBold } from 'react-icons/pi';
import { errorToast } from '../../utils/toast';
import styles from './Login.module.css';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!formData.email.trim()) {
        errorToast('login.errorEmail');
        setIsSubmitting(false);
        return;
      }

      if (!formData.password.trim()) {
        errorToast('login.errorPassword');
        setIsSubmitting(false);
        return;
      }

      const result = await dispatch(loginUser(formData)).unwrap();
      if (result) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      errorToast('login.errorGeneral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>
          {t('login.title', 'Hesaba Giriş')}
        </h2>
        
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>{t('login.emailLabel', 'Email Ünvanı')}</label>
            <input
              className={styles.formInput}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('login.emailPlaceholder', 'Email ünvanınızı daxil edin')}
              required
              disabled={isLoading}
            />
          </div>

    <div className={styles.formGroup}>
  <label>{t('login.passwordLabel', 'Parol')}</label>
  <div className={styles.passwordInputContainer}>
    <input
      className={styles.formInput}
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      onChange={handleInputChange}
      placeholder={t('login.passwordPlaceholder', 'Parolunuzu daxil edin')}
      required
      disabled={isLoading}
    />
    <button
      type="button"
      className={styles.passwordToggle}
      onClick={() => setShowPassword(!showPassword)}
      disabled={isLoading}
      title={showPassword ? "Parolu gizlə" : "Parolu göstər"}
    >
      {showPassword ? (
        <PiEyeBold className={styles.toggleIcon} />
      ) : (
        <PiEyeClosedBold className={styles.toggleIcon} />
      )}
    </button>
  </div>
</div>
          
          <button 
            className={styles.loginButton} 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
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
              t('login.loginButton', 'Daxil Ol')
            )}
          </button>

          <button 
            type="button"
            className={styles.adminButton} 
            onClick={handleAdminLogin}
            disabled={isLoading}
          >
            {t('login.adminLogin', 'Admin Girişi')}
          </button>
        </form>

        <div className={styles.forgotPassword}>
          <Link to="/forgot-password">
            {t('login.forgotPassword', 'Parolu unutmusunuz?')}
          </Link>
        </div>
        
        <div className={styles.authSwitch}>
          {t('login.noAccount', 'Hesabınız yoxdur?')} 
          <Link to="/signup" className={styles.authLink}>
            {t('login.signupLink', 'Qeydiyyat')}
          </Link>
        </div>
      </div>
    </div>
  );
}