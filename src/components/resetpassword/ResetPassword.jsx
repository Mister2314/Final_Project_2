import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import styles from '../ForgotPassword/ForgotPassword.module.css';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { loading } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('access_token');
    if (token) {
      setAccessToken(token);
    } else {
      toast.error('Yanlış və ya köhnə link');
      navigate('/forgot-password');
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!password.trim()) {
        toast.error(t('resetPassword.errorPassword', 'Yeni parol daxil edin'));
        return;
      }

      if (password.length < 6) {
        toast.error(t('resetPassword.errorPasswordLength', 'Parol ən azı 6 simvoldan ibarət olmalıdır'));
        return;
      }

      if (password !== confirmPassword) {
        toast.error(t('resetPassword.errorPasswordMatch', 'Parollar uyğun gəlmir'));
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: searchParams.get('refresh_token') || ''
      });

      if (sessionError) throw sessionError;

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success(t('resetPassword.successMessage', 'Parol uğurla yeniləndi!'));
      navigate('/login');
      
    } catch (error) {
      toast.error(error.message || t('resetPassword.errorGeneric', 'Parol yeniləmə zamanı xəta baş verdi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>
          {t('resetPassword.title', 'Yeni Parol Təyin Edin')}
        </h2>
        <p className={styles.description}>
          {t('resetPassword.description', 'Zəhmət olmasa yeni parolunuzu daxil edin.')}
        </p>
        
        <form className={styles.loginForm} onSubmit={handleResetPassword}>
          <div className={styles.formGroup}>
            <label>{t('resetPassword.passwordLabel', 'Yeni Parol')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('resetPassword.passwordPlaceholder', 'Yeni parolunuzu daxil edin')}
              required
              disabled={loading || isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('resetPassword.confirmPasswordLabel', 'Parolu Təkrar Edin')}</label>
            <input
              className={styles.formInput}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('resetPassword.confirmPasswordPlaceholder', 'Parolunuzu təkrar edin')}
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
              t('resetPassword.updateButton', 'Parolu Yenilə')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('resetPassword.backToLogin', 'Girişə qayıt')} 
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