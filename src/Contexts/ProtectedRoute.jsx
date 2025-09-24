// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Loading screen for protected routes
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading AcadeTrack...</p>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />; // ✅ LoadingScreen used here!
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Show protected content if authenticated
  return children;
};

export default ProtectedRoute;
