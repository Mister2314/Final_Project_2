import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const isAdmin = user && user.role === "admin";

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

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t('toast.error.auth.loginRequired'));
      navigate('/login', { state: { from: location } });
      return;
    }
    
    if (!isAdmin) {
      toast.error(t('toast.error.auth.unauthorized'));
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location, t]);

  if (loading || isCheckingAuth) {
    return <Spinner />;
  }
  
  return <Outlet />;
};

export default AdminRoute;