// Guest Authentication Service
// Provides a simple authentication system that works without database setup

export interface GuestUser {
  id: string;
  email: string;
  name: string;
  age: number;
  isGuest: true;
  createdAt: Date;
}

export class GuestAuthService {
  private static readonly GUEST_KEY = 'educational_rpg_guest_user';
  private static readonly SESSION_KEY = 'educational_rpg_guest_session';

  /**
   * Create a guest user session
   */
  static createGuestUser(name: string, age: number): GuestUser {
    const guestUser: GuestUser = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `guest_${Date.now()}@example.com`,
      name: name || 'Guest User',
      age: age || 10,
      isGuest: true,
      createdAt: new Date()
    };

    // Store in localStorage
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(guestUser));
    localStorage.setItem(this.SESSION_KEY, 'active');

    return guestUser;
  }

  /**
   * Get current guest user
   */
  static getCurrentGuestUser(): GuestUser | null {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      if (session !== 'active') return null;

      const userData = localStorage.getItem(this.GUEST_KEY);
      if (!userData) return null;

      return JSON.parse(userData);
    } catch (error) {
      console.error('Error getting guest user:', error);
      return null;
    }
  }

  /**
   * Check if user is in guest mode
   */
  static isGuestMode(): boolean {
    return !!this.getCurrentGuestUser();
  }

  /**
   * Sign out guest user
   */
  static signOutGuest(): void {
    localStorage.removeItem(this.GUEST_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  /**
   * Update guest user info
   */
  static updateGuestUser(updates: Partial<Pick<GuestUser, 'name' | 'age'>>): GuestUser | null {
    const currentUser = this.getCurrentGuestUser();
    if (!currentUser) return null;

    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(this.GUEST_KEY, JSON.stringify(updatedUser));
    
    return updatedUser;
  }

  /**
   * Get guest user progress (stored locally)
   */
  static getGuestProgress(): any {
    try {
      const progress = localStorage.getItem('educational_rpg_guest_progress');
      return progress ? JSON.parse(progress) : {
        totalXP: 0,
        level: 1,
        questionsAnswered: 0,
        correctAnswers: 0,
        subjects: {}
      };
    } catch (error) {
      console.error('Error getting guest progress:', error);
      return {
        totalXP: 0,
        level: 1,
        questionsAnswered: 0,
        correctAnswers: 0,
        subjects: {}
      };
    }
  }

  /**
   * Update guest user progress
   */
  static updateGuestProgress(progress: any): void {
    try {
      localStorage.setItem('educational_rpg_guest_progress', JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating guest progress:', error);
    }
  }

  /**
   * Clear all guest data
   */
  static clearGuestData(): void {
    localStorage.removeItem(this.GUEST_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('educational_rpg_guest_progress');
  }
}