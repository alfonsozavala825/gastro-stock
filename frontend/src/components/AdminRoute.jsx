import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();

  // The 'auth' logic in App.jsx already prevents non-logged-in users from reaching here,
  // but this is an extra layer of safety.
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user is an 'admin', render the nested child routes.
  // Otherwise, redirect them to the main dashboard.
  return user.rol === 'admin' ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default AdminRoute;
