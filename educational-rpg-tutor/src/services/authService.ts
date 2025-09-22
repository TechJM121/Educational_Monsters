// Authentication service for Educational RPG Tutor
// Handles user registration, login, and parental consent flows

import { supabase } from './supabaseClient';
import type { SignUpData, SignInData, ParentalConsentData, User } from '../types/auth';

export class AuthService {
  /**
   * Sign up a new user with email and password
   * Handles parental consent requirements for users under 13
   */
  static async signUp(data: SignUpData): Promise<{ user: any; needsParentalConsent: boolean }> {
    const { email, password, name, age, parentEmail } = data;
    
    // Validate age requirements
    if (age < 3 || age > 18) {
      throw new Error('Age must be between 3 and 18 years old');
    }
    
    const needsParentalConsent = age < 13;
    
    // If under 13, parent email is required
    if (needsParentalConsent && !parentEmail) {
      throw new Error('Parent email is required for users under 13');
    }
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            age,
            parent_email: parentEmail
          }
        }
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          age,
          parental_consent_given: !needsParentalConsent // Auto-approve if 13+
        });
      
      if (profileError) throw profileError;
      
      // If parental consent is needed, send consent request
      if (needsParentalConsent && parentEmail) {
        await this.sendParentalConsentRequest(authData.user.id, parentEmail, name);
      }
      
      return {
        user: authData.user,
        needsParentalConsent
      };
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }
  
  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData) {
    const { email, password } = data;
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return authData;
      
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(options?: { redirectTo?: string }) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: options?.redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) throw error;
      
      return data;
      
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and create user profile if needed
   */
  static async handleOAuthCallback() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) throw new Error('No user found after OAuth callback');
      
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!existingProfile) {
        // Create user profile from OAuth data
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        
        // For OAuth users, we need to collect age information
        // This will be handled by redirecting to an age collection form
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name,
            age: 0, // Will be updated after age collection
            parental_consent_given: false // Will be determined after age collection
          });
        
        if (profileError) throw profileError;
        
        return { user, needsAgeCollection: true };
      }
      
      return { user, needsAgeCollection: false };
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  /**
   * Complete OAuth user setup with age information
   */
  static async completeOAuthSetup(age: number, parentEmail?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      
      // Validate age requirements
      if (age < 3 || age > 18) {
        throw new Error('Age must be between 3 and 18 years old');
      }
      
      const needsParentalConsent = age < 13;
      
      // If under 13, parent email is required
      if (needsParentalConsent && !parentEmail) {
        throw new Error('Parent email is required for users under 13');
      }
      
      // Update user profile with age information
      const { error: updateError } = await supabase
        .from('users')
        .update({
          age,
          parental_consent_given: !needsParentalConsent,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // If parental consent is needed, send consent request
      if (needsParentalConsent && parentEmail) {
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();
        
        await this.sendParentalConsentRequest(user.id, parentEmail, profile?.name || 'User');
      }
      
      return {
        user,
        needsParentalConsent
      };
      
    } catch (error) {
      console.error('Complete OAuth setup error:', error);
      throw error;
    }
  }
  
  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
  
  /**
   * Get the current user's profile
   */
  static async getCurrentUserProfile(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      return profile ? {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        age: profile.age,
        parentId: profile.parent_id,
        parentalConsentGiven: profile.parental_consent_given,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      } : null;
      
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }
  
  /**
   * Send parental consent request email
   */
  static async sendParentalConsentRequest(childId: string, parentEmail: string, childName: string) {
    try {
      // In a real implementation, this would send an email with a consent link
      // For now, we'll create a consent token and log it
      const consentToken = this.generateConsentToken(childId, parentEmail);
      
      console.log(`Parental consent request for ${childName}:`);
      console.log(`Parent email: ${parentEmail}`);
      console.log(`Consent link: ${window.location.origin}/parental-consent?token=${consentToken}`);
      
      // Store the consent request in the database
      const { error } = await supabase
        .from('parental_consent_requests')
        .insert({
          child_id: childId,
          parent_email: parentEmail,
          consent_token: consentToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
      
      if (error && error.code !== '42P01') { // Ignore table doesn't exist error for now
        console.warn('Could not store consent request:', error);
      }
      
    } catch (error) {
      console.error('Send consent request error:', error);
      throw error;
    }
  }
  
  /**
   * Process parental consent
   */
  static async grantParentalConsent(consentData: ParentalConsentData) {
    const { childEmail, parentEmail, parentName, consentGiven } = consentData;
    
    try {
      // Find the child user
      const { data: childUser, error: childError } = await supabase
        .from('users')
        .select('*')
        .eq('email', childEmail)
        .single();
      
      if (childError) throw childError;
      if (!childUser) throw new Error('Child user not found');
      
      if (consentGiven) {
        // Create parent user if they don't exist
        let parentUser;
        const { data: existingParent } = await supabase
          .from('users')
          .select('*')
          .eq('email', parentEmail)
          .single();
        
        if (!existingParent) {
          // Create parent account
          const { data: parentAuthData, error: parentAuthError } = await supabase.auth.signUp({
            email: parentEmail,
            password: this.generateTemporaryPassword(),
            options: {
              data: {
                name: parentName,
                age: 25, // Default parent age
                is_parent: true
              }
            }
          });
          
          if (parentAuthError) throw parentAuthError;
          if (!parentAuthData.user) throw new Error('Failed to create parent user');
          
          const { error: parentProfileError } = await supabase
            .from('users')
            .insert({
              id: parentAuthData.user.id,
              email: parentEmail,
              name: parentName,
              age: 25,
              parental_consent_given: true
            });
          
          if (parentProfileError) throw parentProfileError;
          parentUser = parentAuthData.user;
        } else {
          parentUser = existingParent;
        }
        
        // Update child user with parent relationship and consent
        const { error: updateError } = await supabase
          .from('users')
          .update({
            parent_id: parentUser.id,
            parental_consent_given: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', childUser.id);
        
        if (updateError) throw updateError;
      } else {
        // Consent denied - disable the child account
        const { error: updateError } = await supabase
          .from('users')
          .update({
            parental_consent_given: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', childUser.id);
        
        if (updateError) throw updateError;
      }
      
    } catch (error) {
      console.error('Grant consent error:', error);
      throw error;
    }
  }
  
  /**
   * Check if user needs parental consent
   */
  static async needsParentalConsent(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('age, parental_consent_given')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (!user) return false;
      
      return user.age < 13 && !user.parental_consent_given;
      
    } catch (error) {
      console.error('Check consent error:', error);
      return false;
    }
  }
  
  /**
   * Generate a secure consent token
   */
  private static generateConsentToken(childId: string, parentEmail: string): string {
    const data = `${childId}:${parentEmail}:${Date.now()}`;
    return btoa(data).replace(/[+/=]/g, (match) => {
      switch (match) {
        case '+': return '-';
        case '/': return '_';
        case '=': return '';
        default: return match;
      }
    });
  }
  
  /**
   * Generate a temporary password for parent accounts
   */
  private static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  /**
   * Reset password for a user
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Update password for authenticated user
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Resend email confirmation
   */
  static async resendEmailConfirmation(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
  }

  /**
   * Update user profile information
   */
  static async updateProfile(updates: Partial<User>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      
      // Update auth metadata if name is being changed
      if (updates.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: updates.name }
        });
        if (authError) throw authError;
      }
      
      // Update profile in database
      const { error: profileError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      return await this.getCurrentUserProfile();
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Check if email is already registered
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      return !!data;
      
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get current session
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Refresh current session
   */
  static async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return !!session?.user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user by ID (admin function)
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return profile ? {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        age: profile.age,
        parentId: profile.parent_id,
        parentalConsentGiven: profile.parental_consent_given,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      } : null;
      
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}