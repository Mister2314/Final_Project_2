import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Notification tracking - daha sadə və effektiv sistem
  const lastNotificationRef = useRef({
    type: null,
    timestamp: null,
    language: null,
  });

  // Minimum interval notifications arasında (milliseconds)
  const NOTIFICATION_COOLDOWN = 2000;

  // Notification göstərmə funksiyası - təkrarlanmaları önləyir
  const showNotification = (type, message, isError = false) => {
    const now = Date.now();
    const currentLang = i18n.language;
    const lastNotification = lastNotificationRef.current;

    // Eyni tip notification çox yaxın vaxtda göstərilibsə və dil eynidir, skip et
    if (
      lastNotification.type === type && 
      lastNotification.language === currentLang &&
      lastNotification.timestamp &&
      (now - lastNotification.timestamp) < NOTIFICATION_COOLDOWN
    ) {
      console.log(`Skipping duplicate ${type} notification`);
      return;
    }

    // Notification göstər
    if (isError) {
      toast.error(message);
    } else {
      toast.success(message);
    }

    // Son notification məlumatlarını yenilə
    lastNotificationRef.current = {
      type,
      timestamp: now,
      language: currentLang,
    };
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
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
      } catch (error) {
        console.error("Authentication check failed:", error);
        handleLogout(false);
      } finally {
        setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const hasExplicitlyLoggedIn =
            localStorage.getItem("userExplicitlyLoggedIn") === "true";
          if (hasExplicitlyLoggedIn) {
            setUser(session.user);
            setIsAuthenticated(true);
            // Auth state change-də toast göstərmə - yalnız login funksiyasında
          }
        } else if (event === "SIGNED_OUT") {
          handleLogout(false);
        }
      }
    );

    checkAuthStatus();

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

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

      // Login uğurlu olduqda notification göstər
      showNotification('login', t("login.successMessage"));

      return true;
    } catch (error) {
      console.error("Login error:", error);
      // Error mesajları həmişə göstər (cooldown yoxdur)
      toast.error(error.message || t("login.errorGeneric"));
      return false;
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

      // Register uğurlu olduqda notification göstər
      showNotification('register', t("signup.successMessage"));

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      // Error mesajları həmişə göstər
      toast.error(error.message || t("signup.errorGeneric"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      showNotification('forgot-password', t("forgotPassword.successMessage") || "Password reset email sent!");

      return { success: true };
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || t("forgotPassword.errorGeneric", "Failed to send reset email"));
      return { 
        success: false, 
        error: error.message || t("forgotPassword.errorGeneric", "Failed to send reset email")
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showNotification('update-password', t("resetPassword.successMessage") || "Password updated successfully!");

      return { success: true };
    } catch (error) {
      console.error("Update password error:", error);
      toast.error(error.message || t("resetPassword.errorGeneric", "Failed to update password"));
      return { 
        success: false, 
        error: error.message || t("resetPassword.errorGeneric", "Failed to update password")
      };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (showToast = true) => {
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem("userExplicitlyLoggedIn");

    if (showToast) {
      showNotification('logout', t("auth.logoutSuccess", "Successfully logged out!"));
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      handleLogout(true);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(
        error.message || t("auth.logoutError", "Error during logout")
      );
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
      showNotification('update-user', t("profile.updateSuccess", "Profile updated successfully!"));
      
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(
        error.message || t("profile.updateError", "Error updating profile")
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    forgotPassword, 
    updatePassword,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};