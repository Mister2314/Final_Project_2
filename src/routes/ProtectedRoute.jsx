import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../redux/slices/userSlice';
import { toast } from 'react-hot-toast';
import Spinner from "../components/Spinner/Spinner";
import { useTranslation } from 'react-i18next';

export const ProtectedRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state) => state.user);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasShownLoginToast, setHasShownLoginToast] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!user) {
          await dispatch(checkAuth()).unwrap();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  useEffect(() => {
    if (!isCheckingAuth && !loading && !isAuthenticated && !hasShownLoginToast) {
      toast.error(t('toast.error.auth.loginRequired'));
      setHasShownLoginToast(true);
    }
  }, [isCheckingAuth, loading, isAuthenticated, hasShownLoginToast]);

  if (loading || isCheckingAuth) {
    return <Spinner />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export const AuthRoute = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.user);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!user) {
          await dispatch(checkAuth()).unwrap();
        }
      } catch (error) {
        // console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  if (loading || isCheckingAuth) {
    return <Spinner />;
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export const AdminRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state) => state.user);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!user) {
          await dispatch(checkAuth()).unwrap();
        }
      } catch (error) {
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  if (loading || isCheckingAuth) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    toast.error("Admin panelinə daxil olmaq üçün login edin.");
    return <Navigate 
      to="/admin/login" 
      state={{ from: location }} 
      replace 
    />;
  }
  const isAdmin = user && user.role === "admin";
    
  if (!isAdmin) {
    toast.error('Bu səhifəyə yalnız adminlər daxil ola bilər.');
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};