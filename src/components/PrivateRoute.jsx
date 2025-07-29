// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.user);
  const location = useLocation();

  if (user.isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!user.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/risetech-project/" replace />;
  }

  return children;
};

export default PrivateRoute;