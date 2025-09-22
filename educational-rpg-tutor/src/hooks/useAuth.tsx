// Custom hook for authentication state management

import { useContext, createContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { MockAuthService } from '../services/mockAuthService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import type { AuthState, AuthAction, AuthContextType, SignUpData, SignInData, ParentalConsentData, OAuthSetupData, GuestUser, GuestConversionData, User, ProfileUpdateData, PasswordValidation } from '../types/auth';

// Use mock service if Supabase isn't configured
const authService = isSupabaseConfigured ? AuthService : MockAuthService;

// Initial auth state
const initialState: AuthState = {
  user: null,
  profile: null,
  guestUser: null,
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
    case 'SET_GUEST_USER':
      return { ...state, guestUser: action.payload };
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
        const profile = await authService.getCurrentUserProfile();
        
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
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await authService.getCurrentUserProfile();
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
      
      const result = await authService.signUp(data);
      
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
      
      const result = await authService.signIn(data);
      
      if (result.user) {
        // Check if user needs parental consent
        const needsConsent = await authService.needsParentalConsent(result.user.id);
        
        if (needsConsent) {
          await authService.signOut();
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
        const profile = await authService.getCurrentUserProfile();
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
      await authService.signOut();
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
      
      await authService.sendParentalConsentRequest(childId, parentEmail, state.profile?.name || 'Student');
      
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
      
      await authService.grantParentalConsent(consentData);
      
      dispatch({ type: 'SET_ERROR', payload: 'Parental consent processed successfully!' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to process consent' });
    }
  };
  
  // Google OAuth sign in
  const signInWithGoogle = async (options?: { redirectTo?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await authService.signInWithGoogle(options);
      // Note: The actual user state will be set by the OAuth callback handler
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Google sign in failed' });
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await authService.handleOAuthCallback();
      
      if (result.user) {
        dispatch({ type: 'SET_USER', payload: {
          id: result.user.id,
          email: result.user.email || '',
          emailConfirmed: !!result.user.email_confirmed_at
        }});
        
        if (!result.needsAgeCollection) {
          const profile = await authService.getCurrentUserProfile();
          dispatch({ type: 'SET_PROFILE', payload: profile });
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'OAuth callback failed' });
      throw error;
    }
  };

  // Complete OAuth setup
  const completeOAuthSetup = async (data: OAuthSetupData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await authService.completeOAuthSetup(data.age, data.parentEmail);
      
      if (result.user && !result.needsParentalConsent) {
        const profile = await authService.getCurrentUserProfile();
        dispatch({ type: 'SET_PROFILE', payload: profile });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'OAuth setup failed' });
      throw error;
    }
  };

  // Password management
  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await authService.resetPassword(email);
      
      dispatch({ type: 'SET_ERROR', payload: 'Password reset email sent! Check your inbox for instructions.' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Password reset failed' });
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await authService.updatePassword(newPassword);
      
      dispatch({ type: 'SET_ERROR', payload: 'Password updated successfully!' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Password update failed' });
    }
  };

  const resendEmailConfirmation = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await authService.resendEmailConfirmation(email);
      
      dispatch({ type: 'SET_ERROR', payload: 'Confirmation email sent! Check your inbox.' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to send confirmation email' });
    }
  };

  // Profile management
  const updateProfile = async (updates: ProfileUpdateData): Promise<User | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const updatedProfile = await authService.updateProfile(updates);
      
      if (updatedProfile) {
        dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return updatedProfile;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Profile update failed' });
      return null;
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getCurrentUserProfile();
      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  // Utility functions
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      return await authService.checkEmailExists(email);
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  };

  const validatePassword = (password: string): PasswordValidation => {
    return authService.validatePassword(password);
  };

  const validateEmail = (email: string): boolean => {
    return authService.validateEmail(email);
  };

  const isAuthenticated = async (): Promise<boolean> => {
    return await authService.isAuthenticated();
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Guest account methods (placeholder implementations)
  const createGuestSession = async (): Promise<GuestUser> => {
    throw new Error('Guest sessions not implemented yet');
  };

  const loadGuestSession = async (sessionToken: string): Promise<GuestUser | null> => {
    throw new Error('Guest sessions not implemented yet');
  };

  const convertGuestToUser = async (sessionToken: string, conversionData: GuestConversionData): Promise<User> => {
    throw new Error('Guest conversion not implemented yet');
  };

  const isGuestSession = (): boolean => {
    return false;
  };

  const getGuestUser = (): GuestUser | null => {
    return null;
  };
  
  const value: AuthContextType = {
    ...state,
    // Core authentication
    signUp,
    signIn,
    signOut,
    
    // OAuth authentication
    signInWithGoogle,
    handleOAuthCallback,
    completeOAuthSetup,
    
    // Password management
    resetPassword,
    updatePassword,
    resendEmailConfirmation,
    
    // Profile management
    updateProfile,
    refreshProfile,
    
    // Parental consent
    requestParentalConsent,
    grantParentalConsent,
    
    // Utility functions
    checkEmailExists,
    validatePassword,
    validateEmail,
    isAuthenticated,
    
    // Error handling
    clearError,
    
    // Guest account methods
    createGuestSession,
    loadGuestSession,
    convertGuestToUser,
    isGuestSession,
    getGuestUser
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