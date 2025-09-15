import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useXPSystem } from '../useXPSystem';
import { createMockCharacter } from '../../test/utils';

// Mock the character service
vi.mock('../../services/characterService', () => ({
  updateCharacterXP: vi.fn(),
  levelUpCharacter: vi.fn(),
}));

describe('useXPSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates XP correctly for basic questions', () => {
    const { result } = renderHook(() => useXPSystem());
    
    const xp = result.current.calculateXP({
      baseDifficulty: 1,
      accuracy: 1.0,
      timeBonus: 0.5,
      statMultiplier: 1.2,
    });
    
    expect(xp).toBe(15); // 10 + 0.5 + 0.15 + 0.24 = ~15
  });

  it('awards XP and updates character', async () => {
    const mockCharacter = createMockCharacter({ currentXP: 50, totalXP: 50 });
    const { result } = renderHook(() => useXPSystem());
    
    await act(async () => {
      await result.current.awardXP(mockCharacter.id, 25);
    });
    
    expect(result.current.isAwarding).toBe(false);
  });

  it('triggers level up when XP threshold reached', async () => {
    const mockCharacter = createMockCharacter({ 
      level: 1, 
      currentXP: 95, 
      totalXP: 95 
    });
    
    const { result } = renderHook(() => useXPSystem());
    
    await act(async () => {
      await result.current.awardXP(mockCharacter.id, 10);
    });
    
    expect(result.current.levelUpTriggered).toBe(true);
  });

  it('calculates correct XP required for next level', () => {
    const { result } = renderHook(() => useXPSystem());
    
    expect(result.current.getXPRequiredForLevel(1)).toBe(100);
    expect(result.current.getXPRequiredForLevel(5)).toBe(100);
    expect(result.current.getXPRequiredForLevel(15)).toBe(150);
    expect(result.current.getXPRequiredForLevel(30)).toBe(200);
  });

  it('handles XP award errors gracefully', async () => {
    const { result } = renderHook(() => useXPSystem());
    
    // Mock service to throw error
    const mockUpdateCharacterXP = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.mocked(require('../../services/characterService').updateCharacterXP)
      .mockImplementation(mockUpdateCharacterXP);
    
    await act(async () => {
      await result.current.awardXP('invalid-id', 10);
    });
    
    expect(result.current.error).toBeTruthy();
  });

  it('applies stat multipliers correctly', () => {
    const { result } = renderHook(() => useXPSystem());
    
    const xpWithHighIntelligence = result.current.calculateXP({
      baseDifficulty: 1,
      accuracy: 1.0,
      timeBonus: 0,
      statMultiplier: 2.0, // High intelligence
    });
    
    const xpWithLowIntelligence = result.current.calculateXP({
      baseDifficulty: 1,
      accuracy: 1.0,
      timeBonus: 0,
      statMultiplier: 1.0,
    });
    
    expect(xpWithHighIntelligence).toBeGreaterThan(xpWithLowIntelligence);
  });
});