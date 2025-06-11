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
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (!user) {
      initializeAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [dispatch, user]);

  if (loading || isCheckingAuth) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    toast.error(t('toast.error.auth.loginRequired'));
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    toast.error(t('toast.error.auth.unauthorized'));
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;