import React from 'react';
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Spinner from "../components/Spinner/Spinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useUser();
  
  if (loading) {
    return <Spinner />;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export const AuthRoute = () => {
  const { isAuthenticated, loading } = useUser();
  
  if (loading) {
    return <Spinner />;
  }
  
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};