import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SimpleUser {
  id: string;
  name: string;
  age: number;
  email: string;
  isGuest: boolean;
}

interface SimpleAuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  error: string | null;
  signOut: () => void;
  clearError: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const session = localStorage.getItem('educational_rpg_session');
        const userData = localStorage.getItem('educational_rpg_user');
        
        if (session === 'active' && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signOut = () => {
    localStorage.removeItem('educational_rpg_session');
    localStorage.removeItem('educational_rpg_user');
    localStorage.removeItem('educational_rpg_progress');
    setUser(null);
    window.location.href = '/auth';
  };

  const clearError = () => {
    setError(null);
  };

  const value: SimpleAuthContextType = {
    user,
    loading,
    error,
    signOut,
    clearError
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}