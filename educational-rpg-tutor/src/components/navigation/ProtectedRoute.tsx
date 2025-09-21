import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../../hooks/useSupabase';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAuth = true 
}) => {
  const { user, loading } = useSupabase();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  if (requiresAuth && !user) {
    // Redirect to login page with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!requiresAuth && user) {
    // Redirect authenticated users away from public pages to the app
    return <Navigate to="/app/home" replace />;
  }

  return <>{children}</>;
};