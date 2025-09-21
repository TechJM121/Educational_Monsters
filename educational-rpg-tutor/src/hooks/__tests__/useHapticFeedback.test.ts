import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHapticFeedback } from '../useHapticFeedback';

// Mock HapticEngine
const mockHapticEngine = {
  getCapabilities: vi.fn(() => ({
    isSupported: true,
    hasVibrationAPI: true,
    hasGamepadHaptics: false,
    maxDuration: 5000,
    supportedPatterns: ['single', 'double', 'triple', 'pattern']
  })),
  getPattern: vi.fn(),
  triggerHaptic: vi.fn().mockResolvedValue(true),
  triggerCustomHaptic: vi.fn().mockResolvedValue(true),
  stopHaptic: vi.fn(),
  testHaptic: vi.fn().mockResolvedValue(true),
  getInstance: vi.fn()
};

vi.mock('../utils/hapticEngine', () => ({
  default: {
    getInstance: () => mockHapticEngine
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useHapticFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Mock pattern responses
    mockHapticEngine.getPattern.mockImplementation((id: string) => ({
      id,
      name: 'Test Pattern',
      pattern: [100],
      description: 'Test pattern',
      category: 'ui'
    }));
  });

  describe('Initialization', () => {
    it('should initialize with default preferences', () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      expect(result.current.preferences.enabled).toBe(true);
      expect(result.current.preferences.intensity).toBe('medium');
      expect(result.current.isSupported).toBe(true);
    });

    it('should load preferences from localStorage', () => {
      const savedPreferences = {
        enabled: false,
        intensity: 'light',
        categorySettings: { ui: false }
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPreferences));
      
      const { result } = renderHook(() => useHapticFeedback());
      
      expect(result.current.preferences.enabled).toBe(false);
      expect(result.current.preferences.intensity).toBe('light');
    });

    it('should handle invalid localStorage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useHapticFeedback());
      
      // Should fall back to defaults
      expect(result.current.preferences.enabled).toBe(true);
    });
  });

  describe('Preference Management', () => {
    it('should update preferences and save to localStorage', () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      act(() => {
        result.current.updatePreferences({ enabled: false });
      });
      
      expect(result.current.preferences.enabled).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'hapticPreferences',
        expect.stringContaining('"enabled":false')
      );
    });

    it('should toggle haptics globally', () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      expect(result.current.preferences.enabled).toBe(true);
      
      act(() => {
        result.current.toggleHaptics();
      });
      
      expect(result.current.preferences.enabled).toBe(false);
    });

    it('should set intensity', () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      act(() => {
        result.current.setIntensity('heavy');
      });
      
      expect(result.current.preferences.intensity).toBe('heavy');
    });

    it('should toggle category-specific haptics', () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      expect(result.current.preferences.categorySettings.ui).toBe(true);
      
      act(() => {
        result.current.toggleCategoryHaptics('ui');
      });
      
      expect(result.current.preferences.categorySettings.ui).toBe(false);
    });
  });

  describe('Haptic Triggering', () => {
    it('should trigger haptic with pattern ID', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      await act(async () => {
        const success = await result.current.triggerHaptic('ui-button-tap');
        expect(success).toBe(true);
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledWith('ui-button-tap', {
        intensity: 'medium'
      });
    });

    it('should not trigger haptic when disabled', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      act(() => {
        result.current.updatePreferences({ enabled: false });
      });
      
      await act(async () => {
        const success = await result.current.triggerHaptic('ui-button-tap');
        expect(success).toBe(false);
      });
      
      expect(mockHapticEngine.triggerHaptic).not.toHaveBeenCalled();
    });

    it('should not trigger haptic when category is disabled', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      act(() => {
        result.current.updatePreferences({
          categorySettings: { ...result.current.preferences.categorySettings, ui: false }
        });
      });
      
      await act(async () => {
        const success = await result.current.triggerHaptic('ui-button-tap');
        expect(success).toBe(false);
      });
      
      expect(mockHapticEngine.triggerHaptic).not.toHaveBeenCalled();
    });

    it('should trigger custom haptic pattern', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      const customPattern = [100, 50, 100];
      
      await act(async () => {
        const success = await result.current.triggerCustomHaptic(customPattern);
        expect(success).toBe(true);
      });
      
      expect(mockHapticEngine.triggerCustomHaptic).toHaveBeenCalledWith(customPattern, {
        intensity: 'medium'
      });
    });

    it('should not trigger custom haptic when disabled', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      act(() => {
        result.current.updatePreferences({ enabled: false });
      });
      
      await act(async () => {
        const success = await result.current.triggerCustomHaptic([100]);
        expect(success).toBe(false);
      });
      
      expect(mockHapticEngine.triggerCustomHaptic).not.toHaveBeenCalled();
    });
  });

  describe('Categorized Haptics', () => {
    it('should provide UI haptic functions', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      await act(async () => {
        await result.current.uiHaptics.buttonTap();
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledWith('ui-button-tap', {
        cooldown: 50,
        intensity: 'medium'
      });
    });

    it('should provide achievement haptic functions', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      // Mock achievement pattern
      mockHapticEngine.getPattern.mockImplementation((id: string) => ({
        id,
        name: 'Achievement Pattern',
        pattern: [200, 100, 200],
        description: 'Achievement pattern',
        category: 'achievement'
      }));
      
      await act(async () => {
        await result.current.achievementHaptics.levelUp();
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledWith('achievement-level-up', {
        intensity: 'heavy'
      });
    });

    it('should provide feedback haptic functions', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      // Mock feedback pattern
      mockHapticEngine.getPattern.mockImplementation((id: string) => ({
        id,
        name: 'Feedback Pattern',
        pattern: [100, 50, 100],
        description: 'Feedback pattern',
        category: 'feedback'
      }));
      
      await act(async () => {
        await result.current.feedbackHaptics.correct();
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledWith('feedback-correct', {
        intensity: 'medium'
      });
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
      const { result } = renderHook(() => useHapticFeedback());
      
      // First trigger should work
      await act(async () => {
        await result.current.triggerHaptic('test-pattern', { cooldown: 1000 });
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledTimes(1);
      
      // Second trigger within cooldown should be blocked
      await act(async () => {
        await result.current.triggerHaptic('test-pattern', { cooldown: 1000 });
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledTimes(1);
      
      // Advance time past cooldown
      act(() => {
        vi.advanceTimersByTime(1001);
      });
      
      // Third trigger after cooldown should work
      await act(async () => {
        await result.current.triggerHaptic('test-pattern', { cooldown: 1000 });
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledTimes(2);
    });

    it('should clear cooldowns when requested', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      // Trigger with cooldown
      await act(async () => {
        await result.current.triggerHaptic('test-pattern', { cooldown: 1000 });
      });
      
      // Clear cooldowns
      act(() => {
        result.current.clearCooldowns();
      });
      
      // Should be able to trigger immediately
      await act(async () => {
        await result.current.triggerHaptic('test-pattern', { cooldown: 1000 });
      });
      
      expect(mockHapticEngine.triggerHaptic).toHaveBeenCalledTimes(2);
    });
  });

  describe('State Management', () => {
    it('should track active state', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      expect(result.current.isActive).toBe(false);
      
      // Mock a longer pattern to test active state
      mockHapticEngine.getPattern.mockReturnValue({
        id: 'long-pattern',
        name: 'Long Pattern',
        pattern: [500],
        description: 'Long pattern',
        category: 'ui'
      });
      
      await act(async () => {
        await result.current.triggerHaptic('long-pattern');
      });
      
      expect(result.current.isActive).toBe(true);
    });

    it('should handle unsupported devices', () => {
      mockHapticEngine.getCapabilities.mockReturnValue({
        isSupported: false,
        hasVibrationAPI: false,
        hasGamepadHaptics: false,
        maxDuration: 0,
        supportedPatterns: []
      });
      
      const { result } = renderHook(() => useHapticFeedback());
      
      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should stop haptic feedback', () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      act(() => {
        result.current.stopHaptic();
      });
      
      expect(mockHapticEngine.stopHaptic).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });

    it('should test haptic functionality', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      await act(async () => {
        const success = await result.current.testHaptic();
        expect(success).toBe(true);
      });
      
      expect(mockHapticEngine.testHaptic).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle haptic trigger errors gracefully', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      mockHapticEngine.triggerHaptic.mockRejectedValue(new Error('Haptic failed'));
      
      await act(async () => {
        const success = await result.current.triggerHaptic('ui-button-tap');
        expect(success).toBe(false);
      });
      
      expect(result.current.isActive).toBe(false);
    });

    it('should handle custom haptic errors gracefully', async () => {
      const { result } = renderHook(() => useHapticFeedback());
      
      mockHapticEngine.triggerCustomHaptic.mockRejectedValue(new Error('Custom haptic failed'));
      
      await act(async () => {
        const success = await result.current.triggerCustomHaptic([100]);
        expect(success).toBe(false);
      });
      
      expect(result.current.isActive).toBe(false);
    });
  });
});