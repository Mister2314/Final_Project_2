import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { loginAdmin } from '../../redux/slices/userSlice';
import styles from './AdminLogin.module.css';
import Header from '../../layout/Header/Header';
import Footer from '../../layout/Footer/Footer';

export default function AdminLogin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!formData.email.trim()) {
        toast.dismiss(); 
        toast.error(t('login.errorEmail', 'Email ünvanı daxil edin'));
        setIsSubmitting(false);
        return;
      }

      if (!formData.password.trim()) {
        toast.dismiss(); 
        toast.error(t('login.errorPassword', 'Parol daxil edin'));
        setIsSubmitting(false);
        return;
      }

      const result = await dispatch(loginAdmin({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      if (result) {
        toast.success(t('admin.loginSuccess', 'Admin panelinə uğurla daxil oldunuz!'));
      
        setFormData({
          email: '',
          password: ''
        });

        navigate(from, { replace: true });
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToRegularLogin = () => {
    navigate('/login');
  };

  const isLoading = loading || isSubmitting;

  return (
    <>
      <Header />
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>
            {t('admin.loginTitle', 'Admin Girişi')}
          </h2>
          
          <form className={styles.loginForm} onSubmit={handleAdminLogin}>
            <div className={styles.formGroup}>
              <label>{t('login.emailLabel', 'Email Ünvanı')}</label>
              <input
                className={styles.formInput}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('admin.emailPlaceholder', 'Admin email ünvanınızı daxil edin')}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('login.passwordLabel', 'Parol')}</label>
              <input
                className={styles.formInput}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('admin.passwordPlaceholder', 'Admin parolunuzu daxil edin')}
                required
                disabled={isLoading}
              />
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
                t('admin.loginButton', 'Admin Girişi')
              )}
            </button>

            <button 
              type="button"
              className={styles.adminButton} 
              onClick={handleBackToRegularLogin}
              disabled={isLoading}
            >
              {t('admin.backToLogin', 'Geri')}
            </button>
          </form>
          
          <div className={styles.authSwitch}>
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
              {t('admin.loginNote', 'Bu səhifə yalnız admin istifadəçiləri üçündür')}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}