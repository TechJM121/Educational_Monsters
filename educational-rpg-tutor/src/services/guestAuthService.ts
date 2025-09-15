// Guest authentication service for Educational RPG Tutor
// Handles temporary guest sessions with local storage and optional server backup

import type { 
  GuestUser, 
  GuestSession, 
  GuestConversionData, 
  User,
  SignUpData 
} from '../types/auth';
import type { Character, AvatarConfig } from '../types/character';
import { AuthService } from './authService';
import { characterService } from './characterService';

export class GuestAuthService {
  private static readonly GUEST_SESSION_KEY = 'rpg_tutor_guest_session';
  private static readonly GUEST_CHARACTER_KEY = 'rpg_tutor_guest_character';
  private static readonly GUEST_PROGRESS_KEY = 'rpg_tutor_guest_progress';
  private static readonly SESSION_DURATION_HOURS = 24;
  private static readonly MAX_SESSION_DURATION_DAYS = 7;

  /**
   * Creates a new guest session with randomized character
   */
  static async createGuestSession(): Promise<GuestUser> {
    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION_HOURS * 60 * 60 * 1000);
      const maxExpiresAt = new Date(Date.now() + this.MAX_SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
      
      const guestUser: GuestUser = {
        id: `guest_${sessionToken}`,
        name: this.generateRandomName(),
        sessionToken,
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      };

      // Create randomized character for guest
      const guestCharacter = this.generateGuestCharacter(guestUser.id, guestUser.name);
      
      // Initialize progress data
      const progressData = {
        questsCompleted: [],
        achievementsUnlocked: [],
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        subjectProgress: {},
        lastActiveAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem(this.GUEST_SESSION_KEY, JSON.stringify(guestUser));
      localStorage.setItem(this.GUEST_CHARACTER_KEY, JSON.stringify(guestCharacter));
      localStorage.setItem(this.GUEST_PROGRESS_KEY, JSON.stringify(progressData));

      // Set cleanup timer
      this.scheduleSessionCleanup(sessionToken, maxExpiresAt);

      return guestUser;
    } catch (error) {
      console.error('Error creating guest session:', error);
      throw new Error('Failed to create guest session');
    }
  }

  /**
   * Loads an existing guest session from localStorage
   */
  static async loadGuestSession(sessionToken?: string): Promise<GuestUser | null> {
    try {
      const storedSession = localStorage.getItem(this.GUEST_SESSION_KEY);
      if (!storedSession) return null;

      const guestUser: GuestUser = JSON.parse(storedSession);
      
      // Check if session has expired
      if (new Date(guestUser.expiresAt) < new Date()) {
        this.clearGuestSession();
        return null;
      }

      // If sessionToken provided, verify it matches
      if (sessionToken && guestUser.sessionToken !== sessionToken) {
        return null;
      }

      // Extend session if still active
      const newExpiresAt = new Date(Date.now() + this.SESSION_DURATION_HOURS * 60 * 60 * 1000);
      guestUser.expiresAt = newExpiresAt.toISOString();
      localStorage.setItem(this.GUEST_SESSION_KEY, JSON.stringify(guestUser));

      return guestUser;
    } catch (error) {
      console.error('Error loading guest session:', error);
      return null;
    }
  }

  /**
   * Gets the current guest character data
   */
  static getGuestCharacter(): Character | null {
    try {
      const storedCharacter = localStorage.getItem(this.GUEST_CHARACTER_KEY);
      if (!storedCharacter) return null;

      return JSON.parse(storedCharacter);
    } catch (error) {
      console.error('Error loading guest character:', error);
      return null;
    }
  }

  /**
   * Updates guest character data in localStorage
   */
  static updateGuestCharacter(character: Character): void {
    try {
      character.updatedAt = new Date();
      localStorage.setItem(this.GUEST_CHARACTER_KEY, JSON.stringify(character));
    } catch (error) {
      console.error('Error updating guest character:', error);
    }
  }

  /**
   * Gets guest progress data
   */
  static getGuestProgress(): any {
    try {
      const storedProgress = localStorage.getItem(this.GUEST_PROGRESS_KEY);
      return storedProgress ? JSON.parse(storedProgress) : null;
    } catch (error) {
      console.error('Error loading guest progress:', error);
      return null;
    }
  }

  /**
   * Updates guest progress data
   */
  static updateGuestProgress(progressData: any): void {
    try {
      progressData.lastActiveAt = new Date().toISOString();
      localStorage.setItem(this.GUEST_PROGRESS_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error updating guest progress:', error);
    }
  }

  /**
   * Converts guest account to permanent user account
   */
  static async convertGuestToUser(
    sessionToken: string, 
    conversionData: GuestConversionData
  ): Promise<User> {
    try {
      // Verify guest session exists
      const guestUser = await this.loadGuestSession(sessionToken);
      if (!guestUser) {
        throw new Error('Guest session not found or expired');
      }

      // Get guest character and progress data
      const guestCharacter = this.getGuestCharacter();
      const guestProgress = this.getGuestProgress();

      if (!guestCharacter) {
        throw new Error('Guest character data not found');
      }

      // Create permanent user account
      const signUpData: SignUpData = {
        email: conversionData.email,
        password: conversionData.password,
        name: conversionData.name || guestUser.name,
        age: conversionData.age || 10, // Default age if not provided
        parentEmail: conversionData.parentEmail
      };

      const { user: newUser } = await AuthService.signUp(signUpData);
      if (!newUser) {
        throw new Error('Failed to create permanent user account');
      }

      // Transfer character data to permanent account
      const permanentCharacter = await characterService.createCharacter(
        newUser.id,
        guestCharacter.name,
        guestCharacter.avatarConfig
      );

      // Update character with guest progress
      if (guestCharacter.level > 1 || guestCharacter.totalXP > 0) {
        // TODO: Update character XP and level in database
        // This would require additional database operations
        console.log('Transferring guest character progress:', {
          level: guestCharacter.level,
          totalXP: guestCharacter.totalXP,
          stats: guestCharacter.stats
        });
      }

      // Transfer progress data
      if (guestProgress) {
        // TODO: Transfer achievements, quest progress, etc.
        console.log('Transferring guest progress data:', guestProgress);
      }

      // Clear guest session data
      this.clearGuestSession();

      // Get the new user profile
      const userProfile = await AuthService.getCurrentUserProfile();
      if (!userProfile) {
        throw new Error('Failed to retrieve new user profile');
      }

      return userProfile;
    } catch (error) {
      console.error('Error converting guest to user:', error);
      throw error;
    }
  }

  /**
   * Checks if current session is a guest session
   */
  static isGuestSession(): boolean {
    const storedSession = localStorage.getItem(this.GUEST_SESSION_KEY);
    if (!storedSession) return false;

    try {
      const guestUser: GuestUser = JSON.parse(storedSession);
      return new Date(guestUser.expiresAt) > new Date();
    } catch {
      return false;
    }
  }

  /**
   * Gets current guest user if session is active
   */
  static getCurrentGuestUser(): GuestUser | null {
    if (!this.isGuestSession()) return null;
    
    try {
      const storedSession = localStorage.getItem(this.GUEST_SESSION_KEY);
      return storedSession ? JSON.parse(storedSession) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clears all guest session data
   */
  static clearGuestSession(): void {
    localStorage.removeItem(this.GUEST_SESSION_KEY);
    localStorage.removeItem(this.GUEST_CHARACTER_KEY);
    localStorage.removeItem(this.GUEST_PROGRESS_KEY);
  }

  /**
   * Cleans up expired guest sessions
   */
  static cleanupExpiredSessions(): void {
    const guestUser = this.getCurrentGuestUser();
    if (!guestUser) return;

    if (new Date(guestUser.expiresAt) < new Date()) {
      this.clearGuestSession();
    }
  }

  /**
   * Generates a secure session token
   */
  private static generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generates a random name for guest characters
   */
  private static generateRandomName(): string {
    const adjectives = [
      'Brave', 'Clever', 'Swift', 'Wise', 'Bold', 'Bright', 'Quick', 'Sharp',
      'Keen', 'Smart', 'Agile', 'Strong', 'Noble', 'Fierce', 'Gentle', 'Kind'
    ];
    
    const nouns = [
      'Explorer', 'Scholar', 'Adventurer', 'Seeker', 'Learner', 'Student',
      'Discoverer', 'Questor', 'Wanderer', 'Thinker', 'Dreamer', 'Hero',
      'Champion', 'Guardian', 'Sage', 'Mystic'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${adjective}${noun}${number}`;
  }

  /**
   * Generates a randomized character for guest users
   */
  private static generateGuestCharacter(userId: string, name: string): Character {
    const avatarConfig: AvatarConfig = {
      hairStyle: this.getRandomChoice(['short', 'long', 'curly', 'straight', 'wavy']),
      hairColor: this.getRandomChoice(['brown', 'black', 'blonde', 'red', 'blue', 'purple']),
      skinTone: this.getRandomChoice(['light', 'medium', 'dark', 'tan']),
      eyeColor: this.getRandomChoice(['brown', 'blue', 'green', 'hazel', 'gray']),
      outfit: this.getRandomChoice(['casual', 'formal', 'adventure', 'magical', 'sporty']),
      accessories: this.getRandomAccessories()
    };

    return {
      id: `guest_char_${Date.now()}`,
      userId,
      name,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      avatarConfig,
      stats: {
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
        dexterity: 10,
        creativity: 10,
        availablePoints: 0
      },
      equippedItems: [],
      isGuestCharacter: true,
      guestSessionId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Gets a random choice from an array
   */
  private static getRandomChoice<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  /**
   * Generates random accessories for character
   */
  private static getRandomAccessories(): string[] {
    const allAccessories = ['hat', 'glasses', 'necklace', 'bracelet', 'ring', 'backpack'];
    const numAccessories = Math.floor(Math.random() * 3); // 0-2 accessories
    const accessories: string[] = [];
    
    for (let i = 0; i < numAccessories; i++) {
      const accessory = this.getRandomChoice(allAccessories);
      if (!accessories.includes(accessory)) {
        accessories.push(accessory);
      }
    }
    
    return accessories;
  }

  /**
   * Schedules cleanup of expired session
   */
  private static scheduleSessionCleanup(sessionToken: string, expiresAt: Date): void {
    const timeUntilExpiry = expiresAt.getTime() - Date.now();
    
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        const currentSession = this.getCurrentGuestUser();
        if (currentSession && currentSession.sessionToken === sessionToken) {
          this.clearGuestSession();
        }
      }, timeUntilExpiry);
    }
  }

  /**
   * Gets guest mode limitations for social features
   */
  static getGuestLimitations() {
    return {
      canAddFriends: false,
      canTrade: false,
      canJoinChallenges: false,
      canViewLeaderboards: true, // Read-only access
      canSendMessages: false,
      maxSessionDuration: this.MAX_SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
      warningThreshold: 2 * 60 * 60 * 1000 // 2 hours before expiry
    };
  }

  /**
   * Checks if guest session is near expiry
   */
  static isSessionNearExpiry(): boolean {
    const guestUser = this.getCurrentGuestUser();
    if (!guestUser) return false;

    const expiresAt = new Date(guestUser.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    return timeUntilExpiry <= this.getGuestLimitations().warningThreshold;
  }
}