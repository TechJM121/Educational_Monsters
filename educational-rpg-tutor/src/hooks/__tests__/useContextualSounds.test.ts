import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContextualSounds } from '../useContextualSounds';

// Mock the useAudioSystem hook
vi.mock('../useAudioSystem', () => ({
  useAudioSystem: vi.fn(() => ({
    playSound: vi.fn().mockResolvedValue(true),
    isReady: true,
    preferences: { isMuted: false }
  }))
}));

describe('useContextualSounds', () => {
  let mockPlaySound: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaySound = vi.fn().mockResolvedValue(true);
    
    const { useAudioSystem } = require('../useAudioSystem');
    vi.mocked(useAudioSystem).mockReturnValue({
      playSound: mockPlaySound,
      isReady: true,
      preferences: { isMuted: false }
    });
  });

  describe('Button Sounds', () => {
    it('should play button click sound with correct options', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.buttonSounds.click();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('ui-button-click', {
        volume: 0.6,
        cooldown: 100
      });
    });

    it('should play button hover sound with correct options', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.buttonSounds.hover();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('ui-button-hover', {
        volume: 0.3,
        cooldown: 200
      });
    });

    it('should allow custom options for button sounds', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.buttonSounds.click({ volume: 0.8, priority: 'high' });
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('ui-button-click', {
        volume: 0.8,
        cooldown: 100,
        priority: 'high'
      });
    });
  });

  describe('Achievement Sounds', () => {
    it('should play level up sound with high priority', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.achievementSounds.levelUp();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('achievement-level-up', {
        volume: 1.0,
        priority: 'high',
        interrupt: true
      });
    });

    it('should play quest complete sound', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.achievementSounds.questComplete();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('achievement-quest-complete', {
        volume: 0.9,
        priority: 'high'
      });
    });
  });

  describe('Feedback Sounds', () => {
    it('should play correct answer sound', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.feedbackSounds.correct();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('feedback-correct-answer', {
        volume: 0.8,
        priority: 'high'
      });
    });

    it('should play incorrect answer sound', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.feedbackSounds.incorrect();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('feedback-wrong-answer', {
        volume: 0.6,
        priority: 'medium'
      });
    });

    it('should play save sound with cooldown', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.feedbackSounds.save();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('feedback-progress-save', {
        volume: 0.4,
        priority: 'low',
        cooldown: 2000
      });
    });
  });

  describe('Navigation Sounds', () => {
    it('should play modal open sound with fade in', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.navigationSounds.modalOpen();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('ui-modal-open', {
        volume: 0.5,
        fadeIn: 0.1
      });
    });

    it('should play modal close sound with fade out', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.navigationSounds.modalClose();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('ui-modal-close', {
        volume: 0.4,
        fadeOut: 0.1
      });
    });
  });

  describe('Form Sounds', () => {
    it('should play input focus sound', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.formSounds.inputFocus();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('ui-input-focus', {
        volume: 0.3,
        cooldown: 200
      });
    });

    it('should play input error sound', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.formSounds.inputError();
      });
      
      expect(mockPlaySound).toHaveBeenCalledWith('ui-input-error', {
        volume: 0.6,
        priority: 'medium'
      });
    });
  });

  describe('Sound Sequences', () => {
    it('should play sound sequence with delays', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      const sounds = [
        { soundId: 'sound1', timing: { delay: 0 } },
        { soundId: 'sound2', timing: { delay: 100 } }
      ];
      
      await act(async () => {
        await result.current.playSoundSequence(sounds);
      });
      
      expect(mockPlaySound).toHaveBeenCalledTimes(2);
      expect(mockPlaySound).toHaveBeenNthCalledWith(1, 'sound1', { fadeIn: undefined, fadeOut: undefined });
      expect(mockPlaySound).toHaveBeenNthCalledWith(2, 'sound2', { fadeIn: undefined, fadeOut: undefined });
    });

    it('should play achievement celebration sequence', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        await result.current.playAchievementCelebration('levelUp');
      });
      
      expect(mockPlaySound).toHaveBeenCalledTimes(2);
      expect(mockPlaySound).toHaveBeenCalledWith('achievement-level-up', { fadeIn: 0.1, fadeOut: undefined });
      expect(mockPlaySound).toHaveBeenCalledWith('celebration-chime', { fadeIn: 0.1, fadeOut: undefined });
    });
  });

  describe('Cooldown Management', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should respect cooldown periods', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      // First call should work
      await act(async () => {
        await result.current.playContextualSound('test-sound', { cooldown: 1000 });
      });
      
      expect(mockPlaySound).toHaveBeenCalledTimes(1);
      
      // Second call within cooldown should be blocked
      await act(async () => {
        await result.current.playContextualSound('test-sound', { cooldown: 1000 });
      });
      
      expect(mockPlaySound).toHaveBeenCalledTimes(1); // Still only 1 call
      
      // Advance time past cooldown
      act(() => {
        vi.advanceTimersByTime(1001);
      });
      
      // Third call after cooldown should work
      await act(async () => {
        await result.current.playContextualSound('test-sound', { cooldown: 1000 });
      });
      
      expect(mockPlaySound).toHaveBeenCalledTimes(2);
    });

    it('should clear cooldowns when requested', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      // Play sound with cooldown
      await act(async () => {
        await result.current.playContextualSound('test-sound', { cooldown: 1000 });
      });
      
      // Clear cooldowns
      act(() => {
        result.current.clearCooldowns();
      });
      
      // Should be able to play immediately
      await act(async () => {
        await result.current.playContextualSound('test-sound', { cooldown: 1000 });
      });
      
      expect(mockPlaySound).toHaveBeenCalledTimes(2);
    });
  });

  describe('State Management', () => {
    it('should not play sounds when audio is not ready', async () => {
      const { useAudioSystem } = require('../useAudioSystem');
      vi.mocked(useAudioSystem).mockReturnValue({
        playSound: mockPlaySound,
        isReady: false,
        preferences: { isMuted: false }
      });
      
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        const success = await result.current.playContextualSound('test-sound');
        expect(success).toBe(false);
      });
      
      expect(mockPlaySound).not.toHaveBeenCalled();
    });

    it('should not play sounds when muted', async () => {
      const { useAudioSystem } = require('../useAudioSystem');
      vi.mocked(useAudioSystem).mockReturnValue({
        playSound: mockPlaySound,
        isReady: true,
        preferences: { isMuted: true }
      });
      
      const { result } = renderHook(() => useContextualSounds());
      
      await act(async () => {
        const success = await result.current.playContextualSound('test-sound');
        expect(success).toBe(false);
      });
      
      expect(mockPlaySound).not.toHaveBeenCalled();
    });

    it('should track active sound count', async () => {
      const { result } = renderHook(() => useContextualSounds());
      
      expect(result.current.getActiveSoundCount()).toBe(0);
      
      await act(async () => {
        await result.current.playContextualSound('test-sound');
      });
      
      expect(result.current.getActiveSoundCount()).toBe(1);
    });
  });
});