
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireVerification = false,
  redirectTo = '/auth',
  fallback = null,
  roles = [],
  permissions = []
}) => {
  const { user, isLoading, logout } = useAuth();
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setAuthChecking(true);
        setAuthError(null);

        // If authentication is not required, allow access
        if (!requireAuth) {
          setAuthChecking(false);
          return;
        }

        // Check if user is authenticated
        const isAuthenticated = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();

        if (!isAuthenticated || !currentUser) {
          // Try to refresh token if available
          const refreshResult = await authService.refreshAuthToken();
          
          if (!refreshResult.success) {
            setAuthError('Authentication required');
            setAuthChecking(false);
            return;
          }
        }

        // Check email verification if required
        if (requireVerification && currentUser && !currentUser.emailVerified) {
          setAuthError('Email verification required');
          setAuthChecking(false);
          return;
        }

        // Check user roles if specified
        if (roles.length > 0 && currentUser) {
          const userRoles = currentUser.roles || [];
          const hasRequiredRole = roles.some(role => userRoles.includes(role));
          
          if (!hasRequiredRole) {
            setAuthError('Insufficient permissions');
            setAuthChecking(false);
            return;
          }
        }

        // Check user permissions if specified
        if (permissions.length > 0 && currentUser) {
          const userPermissions = currentUser.permissions || [];
          const hasRequiredPermission = permissions.some(permission => 
            userPermissions.includes(permission)
          );
          
          if (!hasRequiredPermission) {
            setAuthError('Insufficient permissions');
            setAuthChecking(false);
            return;
          }
        }

        setAuthChecking(false);
      } catch (error) {
        console.error('Authentication check error:', error);
        setAuthError('Authentication check failed');
        setAuthChecking(false);
      }
    };

    checkAuthentication();
  }, [requireAuth, requireVerification, roles, permissions, user]);

  // Show loading while checking authentication
  if (isLoading || authChecking) {
    return fallback || <AuthLoadingComponent />;
  }

  // Handle authentication errors
  if (authError) {
    return <AuthErrorComponent error={authError} redirectTo={redirectTo} />;
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return children;
  }

  // If user is authenticated and passes all checks, render children
  if (user && authService.isAuthenticated()) {
    return children;
  }

  // Fallback to auth error component
  return <AuthErrorComponent error="Access denied" redirectTo={redirectTo} />;
};

// Loading component for authentication checks
const AuthLoadingComponent = () => {
  return (
    <div className="auth-loading">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h3>Authenticating...</h3>
        <p>Please wait while we verify your credentials</p>
      </div>
    </div>
  );
};

// Error component for authentication failures
const AuthErrorComponent = ({ error, redirectTo }) => {
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRedirect = () => {
    setRedirecting(true);
    window.location.href = redirectTo;
  };

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Authentication required':
        return {
          title: 'Authentication Required',
          message: 'You need to sign in to access this page.',
          icon: 'fas fa-lock'
        };
      case 'Email verification required':
        return {
          title: 'Email Verification Required',
          message: 'Please verify your email address to continue.',
          icon: 'fas fa-envelope'
        };
      case 'Insufficient permissions':
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this resource.',
          icon: 'fas fa-ban'
        };
      case 'Authentication check failed':
        return {
          title: 'Authentication Error',
          message: 'There was an error verifying your authentication.',
          icon: 'fas fa-exclamation-triangle'
        };
      default:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this page.',
          icon: 'fas fa-shield-alt'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="auth-error">
      <div className="error-container">
        <div className="error-icon">
          <i className={errorInfo.icon}></i>
        </div>
        
        <h2>{errorInfo.title}</h2>
        <p>{errorInfo.message}</p>
        
        {error === 'Email verification required' && (
          <div className="verification-actions">
            <button 
              className="resend-verification-btn"
              onClick={() => authService.resendEmailVerification()}
            >
              <i className="fas fa-paper-plane"></i>
              Resend Verification Email
            </button>
          </div>
        )}
        
        <div className="redirect-info">
          <p>
            {redirecting ? (
              'Redirecting...'
            ) : (
              <>Redirecting to sign in page in {countdown} seconds</>
            )}
          </p>
          
          <div className="redirect-actions">
            <button 
              className="redirect-now-btn"
              onClick={handleRedirect}
              disabled={redirecting}
            >
              {redirecting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Redirecting...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for route protection
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Hook for checking specific permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const hasAnyPermission = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const hasAllRoles = (roles) => {
    if (!user || !user.roles) return false;
    return roles.every(role => user.roles.includes(role));
  };

  const hasAllPermissions = (permissions) => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  return {
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    hasAllRoles,
    hasAllPermissions,
    userRoles: user?.roles || [],
    userPermissions: user?.permissions || []
  };
};

// Component for conditional rendering based on permissions
export const PermissionGate = ({ 
  roles = [], 
  permissions = [], 
  requireAll = false,
  fallback = null,
  children 
}) => {
  const { hasAnyRole, hasAnyPermission, hasAllRoles, hasAllPermissions } = usePermissions();

  let hasAccess = true;

  if (roles.length > 0) {
    hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }

  if (permissions.length > 0 && hasAccess) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  return hasAccess ? children : fallback;
};

export default ProtectedRoute;
