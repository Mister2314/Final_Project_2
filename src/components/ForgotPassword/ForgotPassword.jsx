import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../SupabaseClient';
import styles from './Login.module.css';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useUser();
  const navigate = useNavigate();

  // Check if coming from a valid reset link
  useEffect(() => {
    const checkHashParams = async () => {
      // The hash contains parameters like #access_token=xxx&refresh_token=yyy&...
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      if (!params.get('access_token')) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };
    
    checkHashParams();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { success, error } = await updatePassword(newPassword);
      
      if (!success) {
        setError(error);
        return;
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Şifrənin Yenilənməsi</h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {success ? (
          <div className={styles.successMessage}>
            <p>Şifrəniz uğurla yeniləndi!</p>
            <p>İndi daxil olma səhifəsinə yönləndirilirsiniz...</p>
          </div>
        ) : (
          <form className={styles.loginForm} onSubmit={handleResetPassword}>
            <div className={styles.formGroup}>
              <label>Yeni Şifrə</label>
              <input
                className={styles.formInput}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifrə daxil edin"
                required
                minLength="8"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Şifrəni Təsdiq Et</label>
              <input
                className={styles.formInput}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrəni təkrar daxil edin"
                required
                minLength="8"
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
                'Şifrəni Yenilə'
              )}
            </button>
          </form>
        )}
        
        <div className={styles.authSwitch}>
          <a href="/login" className={styles.authLink}>Daxil olma səhifəsinə qayıt</a>
        </div>
      </div>
    </div>
  );
}