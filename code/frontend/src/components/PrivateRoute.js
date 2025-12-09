import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <main>
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    // Redirect to login with information about where they came from
    return <Navigate to="/login" state={{ from: location.pathname, message: 'Please login first to access this page' }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/dashboard" 
        state={{ message: `Only ${allowedRoles.join(' or ')} can access this page` }} 
        replace 
      />
    );
  }

  return children;
};

export default PrivateRoute;

