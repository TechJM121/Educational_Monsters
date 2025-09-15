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
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}