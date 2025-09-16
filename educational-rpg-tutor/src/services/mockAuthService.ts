// Mock authentication service for development/testing
// This prevents Supabase connection errors when credentials aren't configured

import type { SignUpData, SignInData, ParentalConsentData, User } from '../types/auth';

export class MockAuthService {
  private static currentUser: User | null = null;
  private static authListeners: Array<(event: string, session: any) => void> = [];

  static async signUp(data: SignUpData): Promise<{ user: any; needsParentalConsent: boolean }> {
    console.log('Mock sign up:', data);
    
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      email: data.email,
      email_confirmed_at: new Date().toISOString()
    };

    const needsParentalConsent = data.age < 13;
    
    if (!needsParentalConsent) {
      this.currentUser = {
        id: mockUser.id,
        email: data.email,
        name: data.name,
        age: data.age,
        parentId: null,
        parentalConsentGiven: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Notify listeners
      this.authListeners.forEach(listener => {
        listener('SIGNED_IN', { user: mockUser });
      });
    }

    return {
      user: mockUser,
      needsParentalConsent
    };
  }

  static async signIn(data: SignInData) {
    console.log('Mock sign in:', data);
    
    const mockUser = {
      id: 'mock-user-signin',
      email: data.email,
      email_confirmed_at: new Date().toISOString()
    };

    this.currentUser = {
      id: mockUser.id,
      email: data.email,
      name: 'Test User',
      age: 16,
      parentId: null,
      parentalConsentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Notify listeners
    this.authListeners.forEach(listener => {
      listener('SIGNED_IN', { user: mockUser });
    });

    return { user: mockUser };
  }

  static async signOut() {
    console.log('Mock sign out');
    this.currentUser = null;
    
    // Notify listeners
    this.authListeners.forEach(listener => {
      listener('SIGNED_OUT', null);
    });
  }

  static async getCurrentUserProfile(): Promise<User | null> {
    return this.currentUser;
  }

  static async sendParentalConsentRequest(childId: string, parentEmail: string, childName: string) {
    console.log(`Mock parental consent request for ${childName} to ${parentEmail}`);
  }

  static async grantParentalConsent(consentData: ParentalConsentData) {
    console.log('Mock parental consent granted:', consentData);
  }

  static async needsParentalConsent(userId: string): Promise<boolean> {
    return false; // For testing, assume no consent needed
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    this.authListeners.push(callback);
    
    // Return mock subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.authListeners.indexOf(callback);
            if (index > -1) {
              this.authListeners.splice(index, 1);
            }
          }
        }
      }
    };
  }
}