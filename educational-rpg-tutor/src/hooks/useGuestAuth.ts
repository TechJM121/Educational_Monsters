// React hook for guest authentication management

import { useState, useEffect, useCallback } from 'react';
import type { GuestUser, GuestConversionData, User } from '../types/auth';
import type { Character } from '../types/character';
import { GuestAuthService } from '../services/guestAuthService';

interface UseGuestAuthReturn {
  guestUser: GuestUser | null;
  guestCharacter: Character | null;
  isGuestSession: boolean;
  isSessionNearExpiry: boolean;
  guestLimitations: ReturnType<typeof GuestAuthService.getGuestLimitations>;
  loading: boolean;
  error: string | null;
  
  // Actions
  createGuestSession: () => Promise<void>;
  loadGuestSession: (sessionToken?: string) => Promise<void>;
  convertToUser: (conversionData: GuestConversionData) => Promise<User>;
  updateGuestCharacter: (character: Character) => void;
  updateGuestProgress: (progressData: any) => void;
  clearSession: () => void;
  clearError: () => void;
}

export function useGuestAuth(): UseGuestAuthReturn {
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [guestCharacter, setGuestCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing guest session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const existingUser = await GuestAuthService.loadGuestSession();
        if (existingUser) {
          setGuestUser(existingUser);
          const character = GuestAuthService.getGuestCharacter();
          setGuestCharacter(character);
        }
      } catch (err) {
        console.error('Error checking existing guest session:', err);
      }
    };

    checkExistingSession();
  }, []);

  // Set up session expiry checking
  useEffect(() => {
    if (!guestUser) return;

    const checkExpiry = () => {
      if (!GuestAuthService.isGuestSession()) {
        setGuestUser(null);
        setGuestCharacter(null);
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [guestUser]);

  const createGuestSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newGuestUser = await GuestAuthService.createGuestSession();
      setGuestUser(newGuestUser);
      
      const character = GuestAuthService.getGuestCharacter();
      setGuestCharacter(character);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create guest session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGuestSession = useCallback(async (sessionToken?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const existingUser = await GuestAuthService.loadGuestSession(sessionToken);
      if (existingUser) {
        setGuestUser(existingUser);
        const character = GuestAuthService.getGuestCharacter();
        setGuestCharacter(character);
      } else {
        setGuestUser(null);
        setGuestCharacter(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load guest session';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const convertToUser = useCallback(async (conversionData: GuestConversionData): Promise<User> => {
    if (!guestUser) {
      throw new Error('No guest session to convert');
    }

    setLoading(true);
    setError(null);
    
    try {
      const newUser = await GuestAuthService.convertGuestToUser(
        guestUser.sessionToken, 
        conversionData
      );
      
      // Clear guest state after successful conversion
      setGuestUser(null);
      setGuestCharacter(null);
      
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert guest account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [guestUser]);

  const updateGuestCharacter = useCallback((character: Character) => {
    if (!guestUser) return;
    
    try {
      GuestAuthService.updateGuestCharacter(character);
      setGuestCharacter(character);
    } catch (err) {
      console.error('Error updating guest character:', err);
      setError('Failed to update character data');
    }
  }, [guestUser]);

  const updateGuestProgress = useCallback((progressData: any) => {
    if (!guestUser) return;
    
    try {
      GuestAuthService.updateGuestProgress(progressData);
    } catch (err) {
      console.error('Error updating guest progress:', err);
      setError('Failed to update progress data');
    }
  }, [guestUser]);

  const clearSession = useCallback(() => {
    GuestAuthService.clearGuestSession();
    setGuestUser(null);
    setGuestCharacter(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    guestUser,
    guestCharacter,
    isGuestSession: !!guestUser && GuestAuthService.isGuestSession(),
    isSessionNearExpiry: GuestAuthService.isSessionNearExpiry(),
    guestLimitations: GuestAuthService.getGuestLimitations(),
    loading,
    error,
    
    createGuestSession,
    loadGuestSession,
    convertToUser,
    updateGuestCharacter,
    updateGuestProgress,
    clearSession,
    clearError
  };
}