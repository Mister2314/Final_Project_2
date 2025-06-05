import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slices/userSlice';
import styles from '../Login/Login.module.css'
import { PiEyeBold, PiEyeClosedBold } from 'react-icons/pi';
import { validateEmail, validatePassword, validateUsername, getValidationError } from '../../utils/validation';
import { errorToast } from '../../utils/toast';

export default function Signup() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
      
    try {
      if (!formData.username.trim()) {
        errorToast('signup.errorUsername');
        setIsSubmitting(false);
        return;
      }

      const usernameError = getValidationError('username', formData.username);
      if (usernameError) {
        errorToast('signup.errorUsernameFormat');
        setIsSubmitting(false);
        return;
      }

      if (!formData.email.trim()) {
        errorToast('signup.errorEmail');
        setIsSubmitting(false);
        return;
      }

      const emailError = getValidationError('email', formData.email);
      if (emailError) {
        errorToast('signup.errorEmailFormat');
        setIsSubmitting(false);
        return;
      }

      if (!formData.password.trim()) {
        errorToast('signup.errorPassword');
        setIsSubmitting(false);
        return;
      }

      const passwordError = getValidationError('password', formData.password);
      if (passwordError) {
        errorToast('signup.errorPasswordFormat');
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        errorToast('signup.errorPasswordMatch');
        setIsSubmitting(false);
        return;
      }

      const result = await dispatch(registerUser(formData)).unwrap();
      if (result) {
        navigate('/login');
      }
    } catch (error) {
      errorToast('signup.errorGeneral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>
          {t('signup.title', 'Hesab Yaradın')}
        </h2>
        
        <form className={styles.loginForm} onSubmit={handleSignup}>
          <div className={styles.formGroup}>
            <label>{t('signup.usernameLabel', 'İstifadəçi Adı')}</label>
            <input
              className={styles.formInput}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={t('signup.usernamePlaceholder', 'İstifadəçi adınızı daxil edin')}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('signup.emailLabel', 'Email Ünvanı')}</label>
            <input
              className={styles.formInput}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('signup.emailPlaceholder', 'Email ünvanınızı daxil edin')}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('signup.passwordLabel', 'Parol')}</label>
            <div className={styles.passwordInputContainer}>
              <input
                className={styles.formInput}
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('signup.passwordPlaceholder', 'Parolunuzu daxil edin')}
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

          <div className={styles.formGroup}>
            <label>{t('signup.confirmPasswordLabel', 'Parolu Təkrar Edin')}</label>
            <div className={styles.passwordInputContainer}>
              <input
                className={styles.formInput}
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder={t('signup.confirmPasswordPlaceholder', 'Parolunuzu təkrar edin')}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                title={showConfirmPassword ? "Parolu gizlə" : "Parolu göstər"}
              >
                {showConfirmPassword ? (
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
              t('signup.signupButton', 'Qeydiyyat')
            )}
          </button>
        </form>
        
        <div className={styles.authSwitch}>
          {t('signup.hasAccount', 'Artıq hesabınız var?')} 
          <Link to="/login" className={styles.authLink}>
            {t('signup.loginLink', 'Daxil ol')}
          </Link>
        </div>
      </div>
    </div>
  );
}