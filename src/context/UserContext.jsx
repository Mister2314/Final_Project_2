import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { supabase } from "../SupabaseClient";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isValidResetToken, setIsValidResetToken] = useState(false);
  const [isCheckingResetToken, setIsCheckingResetToken] = useState(false);

  const loginNotificationShown = useRef(false);
  const registerNotificationShown = useRef(false);
  const logoutNotificationShown = useRef(false);

  // Get current language from localStorage or i18n (only az or en)
  const getCurrentLanguage = () => {
    const lang = localStorage.getItem('i18nextLng') || i18n.language || 'en';
    return (lang === 'az' || lang === 'en') ? lang : 'en';
  };

  useEffect(() => {
    return () => {
      loginNotificationShown.current = false;
      registerNotificationShown.current = false;
      logoutNotificationShown.current = false;
    };
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for password recovery tokens in URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const tokenHash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        
        console.log('URL Auth Parameters:', { 
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          tokenHash, 
          type 
        });
        
        if (type === 'recovery' && (accessToken || tokenHash)) {
          console.log('Password recovery detected in URL');
          
          if (accessToken && refreshToken) {
            // Set session with tokens from URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error("Session set error:", error);
              // Don't show error toast here, let the reset page handle it
              setIsPasswordRecovery(false);
            } else {
              console.log('Password recovery session set successfully');
              setIsPasswordRecovery(true);
              setUser(data.session.user);
              setIsAuthenticated(true);
            }
          } else if (tokenHash) {
            // For token hash, just mark as recovery mode - verification will happen in validateResetToken
            setIsPasswordRecovery(true);
          }
        } else {
          // Normal session check
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const hasExplicitlyLoggedIn =
              localStorage.getItem("userExplicitlyLoggedIn") === "true";

            if (hasExplicitlyLoggedIn) {
              setUser(session.user);
              setIsAuthenticated(true);
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            handleLogout(false);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        handleLogout(false);
      } finally {
        setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        
        if (event === "SIGNED_IN" && session) {
          const hasExplicitlyLoggedIn =
            localStorage.getItem("userExplicitlyLoggedIn") === "true";
          if (hasExplicitlyLoggedIn || isPasswordRecovery) {
            setUser(session.user);
            setIsAuthenticated(true);
          }
        } else if (event === "SIGNED_OUT") {
          handleLogout(false);
        } else if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery event detected");
          setIsPasswordRecovery(true);
          if (session) {
            setUser(session.user);
            setIsAuthenticated(true);
          }
        }
      }
    );

    checkAuthStatus();

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [t, isPasswordRecovery]);

  // Validate password reset token from URL
  const validateResetToken = async (searchParams) => {
    setIsCheckingResetToken(true);
    setIsValidResetToken(false);

    try {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      console.log('Validating reset token - URL Parameters:', { 
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
        tokenHash, 
        type 
      });
      
      if (type === 'recovery') {
        if (accessToken && refreshToken) {
          // Set session with tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Session set error:', error);
            setIsValidResetToken(false);
            return { success: false, error: 'Session setup failed' };
          } else {
            console.log('Session set successfully for password reset');
            setIsValidResetToken(true);
            setIsPasswordRecovery(true);
            setUser(data.session.user);
            setIsAuthenticated(true);
            
            // Clear URL parameters without redirect
            const url = new URL(window.location);
            url.searchParams.delete('access_token');
            url.searchParams.delete('refresh_token');
            url.searchParams.delete('expires_in');
            url.searchParams.delete('token_hash');
            url.searchParams.delete('type');
            window.history.replaceState({}, document.title, url.pathname);
            
            return { success: true };
          }
        } else if (tokenHash) {
          // Try to verify OTP with token hash
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery'
            });
            
            if (error) throw error;
            
            if (data.session) {
              setIsValidResetToken(true);
              setIsPasswordRecovery(true);
              setUser(data.session.user);
              setIsAuthenticated(true);
              
              // Clear URL parameters
              const url = new URL(window.location);
              url.searchParams.delete('token_hash');
              url.searchParams.delete('type');
              window.history.replaceState({}, document.title, url.pathname);
              
              return { success: true };
            } else {
              setIsValidResetToken(false);
              return { success: false, error: 'Invalid token hash' };
            }
          } catch (error) {
            console.error('Token hash verification failed:', error);
            setIsValidResetToken(false);
            return { success: false, error: 'Token verification failed' };
          }
        } else {
          setIsValidResetToken(false);
          return { success: false, error: 'Missing required parameters' };
        }
      } else {
        setIsValidResetToken(false);
        return { success: false, error: 'Invalid link type' };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setIsValidResetToken(false);
      return { success: false, error: 'Link validation failed' };
    } finally {
      setIsCheckingResetToken(false);
    }
  };

  // Validate password strength
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push(t('resetPassword.passwordTooShort') || 'Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push(t('resetPassword.needUppercase') || 'Password must contain uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push(t('resetPassword.needLowercase') || 'Password must contain lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push(t('resetPassword.needNumber') || 'Password must contain number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      localStorage.setItem("userExplicitlyLoggedIn", "true");

      setUser(data.user);
      setIsAuthenticated(true);

      if (!loginNotificationShown.current) {
        const username = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User';
        toast.success(t('login.welcomeMessage', { username }));
        loginNotificationShown.current = true;
      }

      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      
      if (!credentials.skipNotification) {
        toast.error(t('login.errorGeneric'));
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          },
        },
      });

      if (error) throw error;
      localStorage.removeItem("userExplicitlyLoggedIn");
      setUser(null);
      setIsAuthenticated(false);

      if (!userData.skipNotification && !registerNotificationShown.current) {
        toast.success(t('signup.successMessage'));
        registerNotificationShown.current = true;
      }

      return { success: true, data };
    } catch (error) {
      console.error("Registration error:", error);
      
      if (!userData.skipNotification) {
        toast.error(t('signup.errorGeneric'));
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (showToast = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setIsPasswordRecovery(false);
    setIsValidResetToken(false);

    localStorage.removeItem("userExplicitlyLoggedIn");

    if (showToast && !logoutNotificationShown.current) {
      toast.success(t('navigation.logout') + ' ' + 'successful!');
      logoutNotificationShown.current = true;

      setTimeout(() => {
        loginNotificationShown.current = false;
        registerNotificationShown.current = false;
        logoutNotificationShown.current = false;
      }, 500);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      handleLogout(true);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(t('common.loading'));
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: userData.fullName,
        },
      });

      if (error) throw error;

      setUser(data.user);
      toast.success(t('profileSettings.updated'));
      
      return { success: true, data };
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(t('profileSettings.errors.fetchFailed'));
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Send password reset email
  const resetPassword = async (email, options = {}) => {
    setLoading(true);
    try {
      // Determine the redirect URL based on environment
      const baseUrl = window.location.origin;
      const redirectTo = options.redirectTo || `${baseUrl}/reset-password`;
      
      console.log('Sending password reset email to:', email);
      console.log('Redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
        ...options
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('Email not confirmed')) {
          toast.error(t('forgotPassword.emailNotConfirmed') || 'Please confirm your email first');
        } else if (error.message.includes('User not found')) {
          // For security, don't reveal if email exists - show success anyway
          toast.success(t('forgotPassword.emailSentTitle') || 'If the email exists, a reset link has been sent');
        } else {
          throw error;
        }
      } else {
        toast.success(t('forgotPassword.emailSentTitle') || 'Password reset email sent!');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Password reset error:", error);
      
      // Generic error message to avoid revealing system information
      toast.error(t('forgotPassword.errorGeneric') || 'Failed to process request. Please try again.');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Update password after clicking reset link
  const updatePassword = async (newPassword, confirmPassword) => {
    setLoading(true);
    try {
      // Validate passwords
      if (!newPassword.trim()) {
        toast.error(t('resetPassword.errorPassword') || 'Please enter a password');
        return { success: false, error: 'Password required' };
      }

      // Password strength validation
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.errors.join('. '));
        return { success: false, error: passwordValidation.errors.join('. ') };
      }

      // Confirm password validation
      if (newPassword !== confirmPassword) {
        toast.error(t('resetPassword.errorPasswordMismatch') || 'Passwords do not match');
        return { success: false, error: 'Passwords do not match' };
      }

      console.log('Attempting to update password...');
      console.log('Is in password recovery mode:', isPasswordRecovery);
      console.log('Current user:', user?.id);

      // Check if we have a valid session for password recovery
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error(t('resetPassword.sessionExpired') || 'Session expired. Please request a new reset link.');
        return { success: false, error: 'No valid session' };
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        
        // Handle specific errors
        if (error.message.includes('session_not_found')) {
          toast.error(t('resetPassword.sessionExpired') || 'Reset session expired. Please request a new link.');
        } else if (error.message.includes('same_password')) {
          toast.error(t('resetPassword.samePassword') || 'New password must be different from current password');
        } else {
          toast.error(error.message || t('resetPassword.updateError') || 'Failed to update password');
        }
        
        return { success: false, error: error.message };
      }

      console.log('Password updated successfully:', data);

      // Reset password recovery state and set as authenticated
      setIsPasswordRecovery(false);
      setIsValidResetToken(false);
      localStorage.setItem("userExplicitlyLoggedIn", "true");
      setIsAuthenticated(true);
      setUser(data.user);

      toast.success(t('resetPassword.successMessage') || 'Password updated successfully!');
      
      return { success: true, data };
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(t('resetPassword.updateError') || 'Failed to update password');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if we're in password recovery mode
  const isInPasswordRecoveryMode = () => {
    return isPasswordRecovery;
  };

  // Helper function to clear password recovery state
  const clearPasswordRecoveryState = () => {
    setIsPasswordRecovery(false);
    setIsValidResetToken(false);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Reset notification flags when language changes
  useEffect(() => {
    loginNotificationShown.current = false;
    registerNotificationShown.current = false;
    logoutNotificationShown.current = false;
  }, [i18n.language]);

  const value = {
    user,
    loading,
    isAuthenticated,
    isPasswordRecovery,
    isValidResetToken,
    isCheckingResetToken,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    updatePassword,
    validateResetToken,
    validatePassword,
    isInPasswordRecoveryMode,
    clearPasswordRecoveryState,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};