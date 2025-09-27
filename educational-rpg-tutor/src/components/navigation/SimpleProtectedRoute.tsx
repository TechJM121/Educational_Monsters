import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';
// import { AuthDebug } from '../debug/AuthDebug';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

export const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({
  children,
  requiresAuth = true
}) => {
  const { user, loading } = useSimpleAuth();

  // console.log('SimpleProtectedRoute - requiresAuth:', requiresAuth, 'user:', user, 'loading:', loading);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 flex items-center justify-center">
        {/* <AuthDebug /> */}
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, redirect to auth
  if (requiresAuth && !user) {
    // console.log('Redirecting to /auth - requiresAuth:', requiresAuth, 'user:', user);
    return <Navigate to="/auth" replace />;
  }

  // If auth is not required but user is authenticated, allow access
  // If auth is required and user is authenticated, allow access
  return <>{children}</>;
};