// Utility for cleaning up expired guest sessions and managing session lifecycle

import { GuestAuthService } from '../services/guestAuthService';

export class GuestSessionCleanup {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Starts automatic cleanup of expired guest sessions
   */
  static startAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      return; // Already running
    }

    // Run cleanup immediately
    this.performCleanup();

    // Set up recurring cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL_MS);

    console.log('Guest session automatic cleanup started');
  }

  /**
   * Stops automatic cleanup
   */
  static stopAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Guest session automatic cleanup stopped');
    }
  }

  /**
   * Performs immediate cleanup of expired sessions
   */
  static performCleanup(): void {
    try {
      GuestAuthService.cleanupExpiredSessions();
      
      // Additional cleanup for any orphaned data
      this.cleanupOrphanedData();
      
      console.log('Guest session cleanup completed');
    } catch (error) {
      console.error('Error during guest session cleanup:', error);
    }
  }

  /**
   * Cleans up any orphaned guest data that might exist
   */
  private static cleanupOrphanedData(): void {
    try {
      // Check for any localStorage keys that might be orphaned
      const keysToCheck = [
        'rpg_tutor_guest_session',
        'rpg_tutor_guest_character',
        'rpg_tutor_guest_progress'
      ];

      keysToCheck.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            
            // Check if this is expired guest data
            if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
              localStorage.removeItem(key);
              console.log(`Removed expired guest data: ${key}`);
            }
          } catch (parseError) {
            // If we can't parse it, it might be corrupted - remove it
            localStorage.removeItem(key);
            console.log(`Removed corrupted guest data: ${key}`);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up orphaned guest data:', error);
    }
  }

  /**
   * Gets statistics about current guest sessions
   */
  static getSessionStats(): {
    hasActiveSession: boolean;
    sessionAge?: number;
    timeUntilExpiry?: number;
    isNearExpiry: boolean;
  } {
    const guestUser = GuestAuthService.getCurrentGuestUser();
    
    if (!guestUser) {
      return {
        hasActiveSession: false,
        isNearExpiry: false
      };
    }

    const now = Date.now();
    const createdAt = new Date(guestUser.createdAt).getTime();
    const expiresAt = new Date(guestUser.expiresAt).getTime();
    
    return {
      hasActiveSession: true,
      sessionAge: now - createdAt,
      timeUntilExpiry: expiresAt - now,
      isNearExpiry: GuestAuthService.isSessionNearExpiry()
    };
  }

  /**
   * Extends the current guest session if possible
   */
  static extendCurrentSession(): boolean {
    try {
      const guestUser = GuestAuthService.getCurrentGuestUser();
      if (!guestUser) {
        return false;
      }

      // Check if session can be extended (not past max duration)
      const createdAt = new Date(guestUser.createdAt).getTime();
      const maxDuration = GuestAuthService.getGuestLimitations().maxSessionDuration;
      const maxExpiryTime = createdAt + maxDuration;
      
      if (Date.now() >= maxExpiryTime) {
        console.log('Cannot extend session: maximum duration reached');
        return false;
      }

      // Extend session by loading it (which automatically extends expiry)
      GuestAuthService.loadGuestSession(guestUser.sessionToken);
      console.log('Guest session extended successfully');
      return true;
    } catch (error) {
      console.error('Error extending guest session:', error);
      return false;
    }
  }

  /**
   * Warns user about upcoming session expiry
   */
  static checkAndWarnAboutExpiry(): boolean {
    const stats = this.getSessionStats();
    
    if (!stats.hasActiveSession || !stats.isNearExpiry) {
      return false;
    }

    const hoursLeft = stats.timeUntilExpiry ? Math.ceil(stats.timeUntilExpiry / (1000 * 60 * 60)) : 0;
    
    console.warn(`Guest session expires in approximately ${hoursLeft} hour(s)`);
    
    // You could dispatch a custom event here for UI components to listen to
    window.dispatchEvent(new CustomEvent('guestSessionExpiring', {
      detail: { hoursLeft, timeUntilExpiry: stats.timeUntilExpiry }
    }));
    
    return true;
  }

  /**
   * Initializes guest session management for the application
   */
  static initialize(): void {
    // Start automatic cleanup
    this.startAutomaticCleanup();
    
    // Check for expiry warnings on initialization
    this.checkAndWarnAboutExpiry();
    
    // Set up periodic expiry checking
    setInterval(() => {
      this.checkAndWarnAboutExpiry();
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.stopAutomaticCleanup();
    });
    
    console.log('Guest session management initialized');
  }
}