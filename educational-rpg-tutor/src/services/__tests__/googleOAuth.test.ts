import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('../supabaseClient', () => {
  const mockSupabase = {
    auth: {
      signInWithOAuth: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  };

  return {
    supabase: mockSupabase,
    isSupabaseConfigured: true
  };
});

import { AuthService } from '../authService';
import { supabase } from '../supabaseClient';

describe('Google OAuth Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should call Supabase OAuth with correct parameters', async () => {
      const mockData = { url: 'https://accounts.google.com/oauth/authorize?...' };
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ data: mockData, error: null });

      const result = await AuthService.signInWithGoogle();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      expect(result).toEqual(mockData);
    });

    it('should handle custom redirect URL', async () => {
      const customRedirect = 'https://example.com/custom-callback';
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ data: {}, error: null });

      await AuthService.signInWithGoogle({ redirectTo: customRedirect });

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: customRedirect,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
    });

    it('should throw error when OAuth fails', async () => {
      const mockError = new Error('OAuth failed');
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({ data: null, error: mockError });

      await expect(AuthService.signInWithGoogle()).rejects.toThrow('OAuth failed');
    });
  });

  describe('handleOAuthCallback', () => {
    it('should create user profile for new OAuth users', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from as any)().select().eq().single.mockResolvedValue({ data: null, error: null });
      (supabase.from as any)().insert.mockResolvedValue({ error: null });

      const result = await AuthService.handleOAuthCallback();

      expect(result).toEqual({
        user: mockUser,
        needsAgeCollection: true
      });

      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should return existing user without age collection', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      const existingProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        age: 15
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from as any)().select().eq().single.mockResolvedValue({ data: existingProfile, error: null });

      const result = await AuthService.handleOAuthCallback();

      expect(result).toEqual({
        user: mockUser,
        needsAgeCollection: false
      });
    });

    it('should throw error when no user found', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: null });

      await expect(AuthService.handleOAuthCallback()).rejects.toThrow('No user found after OAuth callback');
    });
  });

  describe('completeOAuthSetup', () => {
    it('should update user profile with age information', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from as any)().update().eq.mockResolvedValue({ error: null });

      const result = await AuthService.completeOAuthSetup(15);

      expect(result).toEqual({
        user: mockUser,
        needsParentalConsent: false
      });

      expect((supabase.from as any)().update).toHaveBeenCalledWith({
        age: 15,
        parental_consent_given: true,
        updated_at: expect.any(String)
      });
    });

    it('should require parental consent for users under 13', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from as any)().update().eq.mockResolvedValue({ error: null });
      (supabase.from as any)().select().eq().single.mockResolvedValue({ 
        data: { name: 'Test User' }, 
        error: null 
      });

      // Mock sendParentalConsentRequest
      const sendConsentSpy = vi.spyOn(AuthService, 'sendParentalConsentRequest')
        .mockResolvedValue(undefined);

      const result = await AuthService.completeOAuthSetup(10, 'parent@example.com');

      expect(result).toEqual({
        user: mockUser,
        needsParentalConsent: true
      });

      expect((supabase.from as any)().update).toHaveBeenCalledWith({
        age: 10,
        parental_consent_given: false,
        updated_at: expect.any(String)
      });

      expect(sendConsentSpy).toHaveBeenCalledWith(
        'user-123',
        'parent@example.com',
        'Test User'
      );

      sendConsentSpy.mockRestore();
    });

    it('should validate age requirements', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

      await expect(AuthService.completeOAuthSetup(2)).rejects.toThrow('Age must be between 3 and 18 years old');
      await expect(AuthService.completeOAuthSetup(19)).rejects.toThrow('Age must be between 3 and 18 years old');
    });

    it('should require parent email for users under 13', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };

      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });

      await expect(AuthService.completeOAuthSetup(10)).rejects.toThrow('Parent email is required for users under 13');
    });

    it('should throw error when no authenticated user', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: null });

      await expect(AuthService.completeOAuthSetup(15)).rejects.toThrow('No authenticated user found');
    });
  });
});