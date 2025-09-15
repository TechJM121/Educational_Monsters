// Custom hook for authentication state management

import { useContext, createContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import type { AuthState, AuthAction, AuthContextType, SignUpData, SignInData, ParentalConsentData } from '../types/auth';

// Initial auth state
const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Get current user profile
        const profile = await AuthService.getCurrentUserProfile();
        
        if (mounted) {
          if (profile) {
            dispatch({ type: 'SET_USER', payload: { 
              id: profile.id, 
              email: profile.email, 
              emailConfirmed: true 
            }});
            dispatch({ type: 'SET_PROFILE', payload: profile });
          }
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        if (mounted) {
          console.error('Auth initialization error:', error);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };
    
    initializeAuth();
    
    // Listen to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await AuthService.getCurrentUserProfile();
        dispatch({ type: 'SET_USER', payload: {
          id: session.user.id,
          email: session.user.email || '',
          emailConfirmed: !!session.user.email_confirmed_at
        }});
        dispatch({ type: 'SET_PROFILE', payload: profile });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_PROFILE', payload: null });
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign up function
  const signUp = async (data: SignUpData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await AuthService.signUp(data);
      
      if (result.needsParentalConsent) {
        dispatch({ type: 'SET_ERROR', payload: 'Account created! Parental consent email has been sent. Please check your parent\'s email to activate your account.' });
      } else {
        dispatch({ type: 'SET_USER', payload: {
          id: result.user.id,
          email: result.user.email || '',
          emailConfirmed: !!result.user.email_confirmed_at
        }});
        
        // Fetch profile
        const profile = await AuthService.getCurrentUserProfile();
        dispatch({ type: 'SET_PROFILE', payload: profile });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign up failed' });
    }
  };
  
  // Sign in function
  const signIn = async (data: SignInData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await AuthService.signIn(data);
      
      if (result.user) {
        // Check if user needs parental consent
        const needsConsent = await AuthService.needsParentalConsent(result.user.id);
        
        if (needsConsent) {
          await AuthService.signOut();
          dispatch({ type: 'SET_ERROR', payload: 'Your account is waiting for parental consent. Please ask your parent to check their email.' });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        dispatch({ type: 'SET_USER', payload: {
          id: result.user.id,
          email: result.user.email || '',
          emailConfirmed: !!result.user.email_confirmed_at
        }});
        
        // Fetch profile
        const profile = await AuthService.getCurrentUserProfile();
        dispatch({ type: 'SET_PROFILE', payload: profile });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign in failed' });
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await AuthService.signOut();
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_PROFILE', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Sign out failed' });
    }
  };
  
  // Request parental consent
  const requestParentalConsent = async (childId: string, parentEmail: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await AuthService.sendParentalConsentRequest(childId, parentEmail, state.profile?.name || 'Student');
      
      dispatch({ type: 'SET_ERROR', payload: 'Parental consent request sent successfully!' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to send consent request' });
    }
  };
  
  // Grant parental consent
  const grantParentalConsent = async (consentData: ParentalConsentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await AuthService.grantParentalConsent(consentData);
      
      dispatch({ type: 'SET_ERROR', payload: 'Parental consent processed successfully!' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to process consent' });
    }
  };
  
  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
  
  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    requestParentalConsent,
    grantParentalConsent,
    clearError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}