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

  const loginNotificationShown = useRef(false);
  const registerNotificationShown = useRef(false);
  const logoutNotificationShown = useRef(false);

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

      if (!loginNotificationShown.current) {
        toast.success(t("login.successMessage"));
        loginNotificationShown.current = true;
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
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

      if (!registerNotificationShown.current) {
        toast.success(t("signup.successMessage"));
        registerNotificationShown.current = true;
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || t("signup.errorGeneric"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // YENI EKLENEN FORGOT PASSWORD FONKSİYONU
  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Forgot password error:", error);
      return { 
        success: false, 
        error: error.message || t("forgotPassword.errorGeneric", "Failed to send reset email")
      };
    } finally {
      setLoading(false);
    }
  };

  // YENI EKLENEN UPDATE PASSWORD FONKSİYONU
  const updatePassword = async (newPassword) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Update password error:", error);
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

    if (showToast && !logoutNotificationShown.current) {
      toast.success(t("auth.logoutSuccess", "Successfully logged out!"));
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
      toast.success(
        t("profile.updateSuccess", "Profile updated successfully!")
      );
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

  useEffect(() => {
    loginNotificationShown.current = false;
    registerNotificationShown.current = false;
    logoutNotificationShown.current = false;
  }, [i18n.language]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    forgotPassword, // YENI EKLENEN FONKSİYON
    updatePassword, // YENI EKLENEN FONKSİYON
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};