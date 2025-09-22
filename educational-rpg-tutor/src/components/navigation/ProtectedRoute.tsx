import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAuth = true 
}) => {
  // For now, allow all routes to work in guest mode
  // In a real app, you would check authentication here
  return <>{children}</>;
};