import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // or a spinner
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default PublicRoute; 