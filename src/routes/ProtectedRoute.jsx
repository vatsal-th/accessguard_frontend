import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) return null; // or a spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

export default ProtectedRoute; 