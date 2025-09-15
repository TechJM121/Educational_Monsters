import React from 'react';
import { AuthManager } from '../components/auth/AuthManager';
import { PageTransition } from '../components/navigation/PageTransition';

export const AuthPage: React.FC = () => {
  return (
    <PageTransition>
      <AuthManager onAuthComplete={() => {
        // Navigation will be handled by the router
        console.log('Authentication completed');
      }} />
    </PageTransition>
  );
};