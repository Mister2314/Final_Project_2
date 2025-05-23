import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { updatePassword } = useUser(); // loading burada yoxdur, local idarə edək
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      // Hash formatını oxuyuruq: #access_token=...&refresh_token=...
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (accessToken && refreshToken && type === 'recovery') {
        try {
          const { supabase } = await import('../../supabaseClient');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            toast.error(t('resetPassword.invalidToken'));
            if (isMounted) {
              setIsValidToken(false);
              setIsCheckingToken(false);
              setTimeout(() => navigate('/forgot-password'), 3000);
            }
          } else {
            if (isMounted) {
              setIsValidToken(true);
              setIsCheckingToken(false);
            }
          }
        } catch (err) {
          toast.error(t('resetPassword.invalidToken'));
          if (isMounted) {
            setIsValidToken(false);
            setIsCheckingToken(false);
            setTimeout(() => navigate('/forgot-password'), 3000);
          }
        }
      } else {
        toast.error(t('resetPassword.invalidToken'));
        if (isMounted) {
          setIsValidToken(false);
          setIsCheckingToken(false);
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [navigate, t]);

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

    setLoading(true);
    try {
      const result = await updatePassword(password);

      if (result.success) {
        toast.success(t('resetPassword.successMessage'));
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(result.message || t('resetPassword.errorUpdating'));
      }
    } catch (error) {
      toast.error(t('resetPassword.errorUpdating'));
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.pawLoaderContainer}>
            <div className={styles.pawLoader}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.pawPrint}></div>
              ))}
            </div>
          </div>
          <p className={styles.description}>{t('resetPassword.verifying')}</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.errorIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
              <path d="m15 9-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m9 9 6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className={styles.loginTitle}>{t('resetPassword.invalidTokenTitle')}</h2>
          <p className={styles.description}>{t('resetPassword.invalidTokenDescription')}</p>
          <button className={styles.loginButton} onClick={() => navigate('/forgot-password')}>
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
        <p className={styles.description}>{t('resetPassword.description')}</p>

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
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.pawPrint}></div>
                  ))}
                </div>
              </div>
            ) : (
              t('resetPassword.updateButton')
            )}
          </button>
        </form>

        <div className={styles.authSwitch}>
          {t('resetPassword.rememberPassword')}{' '}
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { updatePassword } = useUser(); // loading burada yoxdur, local idarə edək
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      // Hash formatını oxuyuruq: #access_token=...&refresh_token=...
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (accessToken && refreshToken && type === 'recovery') {
        try {
          const { supabase } = await import('../../supabaseClient');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            toast.error(t('resetPassword.invalidToken'));
            if (isMounted) {
              setIsValidToken(false);
              setIsCheckingToken(false);
              setTimeout(() => navigate('/forgot-password'), 3000);
            }
          } else {
            if (isMounted) {
              setIsValidToken(true);
              setIsCheckingToken(false);
            }
          }
        } catch (err) {
          toast.error(t('resetPassword.invalidToken'));
          if (isMounted) {
            setIsValidToken(false);
            setIsCheckingToken(false);
            setTimeout(() => navigate('/forgot-password'), 3000);
          }
        }
      } else {
        toast.error(t('resetPassword.invalidToken'));
        if (isMounted) {
          setIsValidToken(false);
          setIsCheckingToken(false);
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [navigate, t]);

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

    setLoading(true);
    try {
      const result = await updatePassword(password);

      if (result.success) {
        toast.success(t('resetPassword.successMessage'));
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(result.message || t('resetPassword.errorUpdating'));
      }
    } catch (error) {
      toast.error(t('resetPassword.errorUpdating'));
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.pawLoaderContainer}>
            <div className={styles.pawLoader}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.pawPrint}></div>
              ))}
            </div>
          </div>
          <p className={styles.description}>{t('resetPassword.verifying')}</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.errorIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
              <path d="m15 9-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m9 9 6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className={styles.loginTitle}>{t('resetPassword.invalidTokenTitle')}</h2>
          <p className={styles.description}>{t('resetPassword.invalidTokenDescription')}</p>
          <button className={styles.loginButton} onClick={() => navigate('/forgot-password')}>
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
        <p className={styles.description}>{t('resetPassword.description')}</p>

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
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.pawPrint}></div>
                  ))}
                </div>
              </div>
            ) : (
              t('resetPassword.updateButton')
            )}
          </button>
        </form>

        <div className={styles.authSwitch}>
          {t('resetPassword.rememberPassword')}{' '}
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
