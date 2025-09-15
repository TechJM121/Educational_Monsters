// Tests for guest authentication service

import { GuestAuthService } from '../guestAuthService';
import type { GuestUser, GuestConversionData } from '../../types/auth';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.getRandomValues
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock AuthService
vi.mock('../authService', () => ({
  AuthService: {
    signUp: vi.fn(),
    getCurrentUserProfile: vi.fn(),
  },
}));

// Mock characterService
vi.mock('../characterService', () => ({
  characterService: {
    createCharacter: vi.fn(),
  },
}));

describe('GuestAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('createGuestSession', () => {
    it('should create a new guest session with randomized character', async () => {
      const guestUser = await GuestAuthService.createGuestSession();

      expect(guestUser).toMatchObject({
        id: expect.stringMatching(/^guest_/),
        name: expect.any(String),
        sessionToken: expect.any(String),
        isGuest: true,
        createdAt: expect.any(String),
        expiresAt: expect.any(String),
      });

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rpg_tutor_guest_session',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rpg_tutor_guest_character',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rpg_tutor_guest_progress',
        expect.any(String)
      );
    });

    it('should generate unique session tokens', async () => {
      const session1 = await GuestAuthService.createGuestSession();
      const session2 = await GuestAuthService.createGuestSession();

      expect(session1.sessionToken).not.toBe(session2.sessionToken);
      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('loadGuestSession', () => {
    it('should return null if no session exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await GuestAuthService.loadGuestSession();

      expect(result).toBeNull();
    });

    it('should return null if session is expired', async () => {
      const expiredSession: GuestUser = {
        id: 'guest_123',
        name: 'TestUser',
        sessionToken: 'token123',
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      const result = await GuestAuthService.loadGuestSession();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3);
    });

    it('should extend session expiry for valid sessions', async () => {
      const validSession: GuestUser = {
        id: 'guest_123',
        name: 'TestUser',
        sessionToken: 'token123',
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(), // Valid
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validSession));

      const result = await GuestAuthService.loadGuestSession();

      expect(result).not.toBeNull();
      expect(result?.sessionToken).toBe('token123');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rpg_tutor_guest_session',
        expect.any(String)
      );
    });

    it('should validate session token if provided', async () => {
      const validSession: GuestUser = {
        id: 'guest_123',
        name: 'TestUser',
        sessionToken: 'token123',
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validSession));

      const result1 = await GuestAuthService.loadGuestSession('token123');
      const result2 = await GuestAuthService.loadGuestSession('wrong_token');

      expect(result1).not.toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('getGuestCharacter', () => {
    it('should return null if no character data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = GuestAuthService.getGuestCharacter();

      expect(result).toBeNull();
    });

    it('should return parsed character data', () => {
      const characterData = {
        id: 'char_123',
        userId: 'guest_123',
        name: 'TestCharacter',
        level: 1,
        totalXP: 0,
        currentXP: 0,
        isGuestCharacter: true,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(characterData));

      const result = GuestAuthService.getGuestCharacter();

      expect(result).toEqual(characterData);
    });
  });

  describe('updateGuestCharacter', () => {
    it('should update character data in localStorage', () => {
      const character = {
        id: 'char_123',
        userId: 'guest_123',
        name: 'TestCharacter',
        level: 2,
        totalXP: 100,
        currentXP: 50,
        updatedAt: new Date('2023-01-01'),
      } as any;

      GuestAuthService.updateGuestCharacter(character);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'rpg_tutor_guest_character',
        expect.stringContaining('"level":2')
      );
      expect(character.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isGuestSession', () => {
    it('should return false if no session exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = GuestAuthService.isGuestSession();

      expect(result).toBe(false);
    });

    it('should return false if session is expired', () => {
      const expiredSession: GuestUser = {
        id: 'guest_123',
        name: 'TestUser',
        sessionToken: 'token123',
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      const result = GuestAuthService.isGuestSession();

      expect(result).toBe(false);
    });

    it('should return true for valid sessions', () => {
      const validSession: GuestUser = {
        id: 'guest_123',
        name: 'TestUser',
        sessionToken: 'token123',
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validSession));

      const result = GuestAuthService.isGuestSession();

      expect(result).toBe(true);
    });
  });

  describe('clearGuestSession', () => {
    it('should remove all guest data from localStorage', () => {
      GuestAuthService.clearGuestSession();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('rpg_tutor_guest_session');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('rpg_tutor_guest_character');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('rpg_tutor_guest_progress');
    });
  });

  describe('getGuestLimitations', () => {
    it('should return correct limitations object', () => {
      const limitations = GuestAuthService.getGuestLimitations();

      expect(limitations).toEqual({
        canAddFriends: false,
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      });
    });
  });

  describe('isSessionNearExpiry', () => {
    it('should return false if no guest session', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = GuestAuthService.isSessionNearExpiry();

      expect(result).toBe(false);
    });

    it('should return true if session expires within warning threshold', () => {
      const nearExpirySession: GuestUser = {
        id: 'guest_123',
        name: 'TestUser',
        sessionToken: 'token123',
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour left
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(nearExpirySession));

      const result = GuestAuthService.isSessionNearExpiry();

      expect(result).toBe(true);
    });

    it('should return false if session has plenty of time left', () => {
      const validSession: GuestUser = {
        id: 'guest_123',
        name: 'TestUser',
        sessionToken: 'token123',
        isGuest: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // 10 hours left
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validSession));

      const result = GuestAuthService.isSessionNearExpiry();

      expect(result).toBe(false);
    });
  });
});