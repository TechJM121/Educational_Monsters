// Authentication and user types for the Educational RPG Tutor

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  parentId?: string;
  parentalConsentGiven: boolean;
  isGuest?: boolean;
  guestSessionId?: string;
  guestExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestUser {
  id: string;
  name: string;
  age?: number;
  sessionToken: string;
  isGuest: true;
  createdAt: string;
  expiresAt: string;
}

export interface GuestSession {
  id: string;
  sessionToken: string;
  characterData: any;
  progressData: any;
  createdAt: string;
  expiresAt: string;
}

export interface GuestConversionData {
  email: string;
  password: string;
  name?: string;
  age?: number;
  parentEmail?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  age: number;
  parentEmail?: string; // Required for users under 13
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ParentalConsentData {
  childEmail: string;
  parentEmail: string;
  parentName: string;
  consentGiven: boolean;
  consentDate: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: User | null;
  guestUser: GuestUser | null;
  loading: boolean;
  error: string | null;
}

export interface OAuthSetupData {
  age: number;
  parentEmail?: string; // Required for users under 13
}

export interface PasswordResetData {
  email: string;
}

export interface UpdatePasswordData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  name?: string;
  age?: number;
  parentEmail?: string;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export interface AuthContextType extends AuthState {
  // Core authentication
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  
  // OAuth authentication
  signInWithGoogle: (options?: { redirectTo?: string }) => Promise<void>;
  handleOAuthCallback: () => Promise<{ user: any; needsAgeCollection: boolean }>;
  completeOAuthSetup: (data: OAuthSetupData) => Promise<{ user: any; needsParentalConsent: boolean }>;
  
  // Password management
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendEmailConfirmation: (email: string) => Promise<void>;
  
  // Profile management
  updateProfile: (updates: ProfileUpdateData) => Promise<User | null>;
  refreshProfile: () => Promise<void>;
  
  // Parental consent
  requestParentalConsent: (childId: string, parentEmail: string) => Promise<void>;
  grantParentalConsent: (consentData: ParentalConsentData) => Promise<void>;
  
  // Utility functions
  checkEmailExists: (email: string) => Promise<boolean>;
  validatePassword: (password: string) => PasswordValidation;
  validateEmail: (email: string) => boolean;
  isAuthenticated: () => Promise<boolean>;
  
  // Error handling
  clearError: () => void;
  
  // Guest account methods
  createGuestSession: () => Promise<GuestUser>;
  loadGuestSession: (sessionToken: string) => Promise<GuestUser | null>;
  convertGuestToUser: (sessionToken: string, conversionData: GuestConversionData) => Promise<User>;
  isGuestSession: () => boolean;
  getGuestUser: () => GuestUser | null;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_PROFILE'; payload: User | null }
  | { type: 'SET_GUEST_USER'; payload: GuestUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };