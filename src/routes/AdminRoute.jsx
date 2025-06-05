import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../redux/slices/userSlice';
import { toast } from 'react-hot-toast';
import Spinner from "../components/Spinner/Spinner";
import { useTranslation } from 'react-i18next';

export const AdminRoute = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state) => state.user);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        // console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (loading || isCheckingAuth) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    toast.error(t('toast.error.auth.loginRequired'));
    return <Navigate 
      to="/admin/login" 
      state={{ from: location }} 
      replace 
    />;
  }

  const isAdmin = user && user.role === "admin";
  
  if (!isAdmin) {
    toast.error(t('toast.error.auth.unauthorized'));
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;