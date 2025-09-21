import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import HapticEngine from '../hapticEngine';

// Mock navigator.vibrate
const mockVibrate = vi.fn();
const mockGetGamepads = vi.fn();

Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: mockVibrate
});

Object.defineProperty(navigator, 'getGamepads', {
  writable: true,
  value: mockGetGamepads
});

describe('HapticEngine', () => {
  let hapticEngine: HapticEngine;

  beforeEach(() => {
    // Reset singleton instance
    (HapticEngine as any).instance = undefined;
    hapticEngine = HapticEngine.getInstance();
    vi.clearAllMocks();
    mockVibrate.mockReturnValue(true);
    mockGetGamepads.mockReturnValue([]);
  });

  afterEach(() => {
    hapticEngine.stopHaptic();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = HapticEngine.getInstance();
      const instance2 = HapticEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Capability Detection', () => {
    it('should detect vibration API support', () => {
      const capabilities = hapticEngine.getCapabilities();
      expect(capabilities.hasVibrationAPI).toBe(true);
      expect(capabilities.isSupported).toBe(true);
    });

    it('should detect lack of vibration API support', () => {
      // Remove vibrate from navigator
      Object.defineProperty(navigator, 'vibrate', { value: undefined });
      
      // Reset singleton to test with new navigator state
      (HapticEngine as any).instance = undefined;
      const unsupportedEngine = HapticEngine.getInstance();
      
      const capabilities = unsupportedEngine.getCapabilities();
      expect(capabilities.hasVibrationAPI).toBe(false);
      expect(capabilities.isSupported).toBe(false);
    });

    it('should detect gamepad haptics support', () => {
      const capabilities = hapticEngine.getCapabilities();
      expect(capabilities.hasGamepadHaptics).toBe(true);
    });
  });

  describe('Pattern Management', () => {
    it('should initialize with predefined patterns', () => {
      const uiPatterns = hapticEngine.getPatternsByCategory('ui');
      expect(uiPatterns.length).toBeGreaterThan(0);
      
      const achievementPatterns = hapticEngine.getPatternsByCategory('achievement');
      expect(achievementPatterns.length).toBeGreaterThan(0);
    });

    it('should retrieve pattern by ID', () => {
      const pattern = hapticEngine.getPattern('ui-button-tap');
      expect(pattern).toBeDefined();
      expect(pattern?.id).toBe('ui-button-tap');
      expect(pattern?.category).toBe('ui');
    });

    it('should return undefined for non-existent pattern', () => {
      const pattern = hapticEngine.getPattern('non-existent');
      expect(pattern).toBeUndefined();
    });

    it('should get all patterns', () => {
      const allPatterns = hapticEngine.getAllPatterns();
      expect(allPatterns.length).toBeGreaterThan(0);
      
      // Check that we have patterns from different categories
      const categories = new Set(allPatterns.map(p => p.category));
      expect(categories.size).toBeGreaterThan(1);
    });
  });

  describe('Haptic Triggering', () => {
    it('should trigger haptic with valid pattern', async () => {
      const success = await hapticEngine.triggerHaptic('ui-button-tap');
      
      expect(success).toBe(true);
      expect(mockVibrate).toHaveBeenCalled();
    });

    it('should return false for non-existent pattern', async () => {
      const success = await hapticEngine.triggerHaptic('non-existent');
      
      expect(success).toBe(false);
      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should trigger custom haptic pattern', async () => {
      const customPattern = [100, 50, 100];
      const success = await hapticEngine.triggerCustomHaptic(customPattern);
      
      expect(success).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(customPattern);
    });

    it('should handle vibration API failure gracefully', async () => {
      mockVibrate.mockReturnValue(false);
      
      const success = await hapticEngine.triggerHaptic('ui-button-tap');
      
      expect(success).toBe(false);
    });

    it('should not trigger haptic when not supported', async () => {
      // Remove vibrate support
      Object.defineProperty(navigator, 'vibrate', { value: undefined });
      Object.defineProperty(navigator, 'getGamepads', { value: undefined });
      
      // Reset singleton
      (HapticEngine as any).instance = undefined;
      const unsupportedEngine = HapticEngine.getInstance();
      
      const success = await unsupportedEngine.triggerHaptic('ui-button-tap');
      
      expect(success).toBe(false);
    });
  });

  describe('Intensity Adjustment', () => {
    it('should adjust pattern intensity correctly', async () => {
      const pattern = hapticEngine.getPattern('ui-button-tap');
      expect(pattern).toBeDefined();
      
      // Test light intensity (should reduce duration)
      await hapticEngine.triggerHaptic('ui-button-tap', { intensity: 'light' });
      const lightCall = mockVibrate.mock.calls[0][0];
      
      vi.clearAllMocks();
      
      // Test heavy intensity (should increase duration)
      await hapticEngine.triggerHaptic('ui-button-tap', { intensity: 'heavy' });
      const heavyCall = mockVibrate.mock.calls[0][0];
      
      // Heavy should have longer durations than light
      expect(heavyCall[0]).toBeGreaterThan(lightCall[0]);
    });

    it('should respect maximum duration limits', async () => {
      const longPattern = [10000]; // 10 seconds
      await hapticEngine.triggerCustomHaptic(longPattern, { intensity: 'heavy' });
      
      const calledPattern = mockVibrate.mock.calls[0][0];
      const capabilities = hapticEngine.getCapabilities();
      
      expect(calledPattern[0]).toBeLessThanOrEqual(capabilities.maxDuration);
    });
  });

  describe('Timing and Delays', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle delay option', async () => {
      const triggerPromise = hapticEngine.triggerHaptic('ui-button-tap', { delay: 500 });
      
      // Should not have triggered yet
      expect(mockVibrate).not.toHaveBeenCalled();
      
      // Advance time
      vi.advanceTimersByTime(500);
      await triggerPromise;
      
      expect(mockVibrate).toHaveBeenCalled();
    });

    it('should track active state correctly', async () => {
      expect(hapticEngine.isHapticActive()).toBe(false);
      
      const triggerPromise = hapticEngine.triggerHaptic('ui-button-tap');
      expect(hapticEngine.isHapticActive()).toBe(true);
      
      await triggerPromise;
      
      // Advance time to simulate haptic completion
      vi.advanceTimersByTime(100);
      
      expect(hapticEngine.isHapticActive()).toBe(false);
    });
  });

  describe('Haptic Control', () => {
    it('should stop haptic feedback', () => {
      hapticEngine.stopHaptic();
      
      expect(mockVibrate).toHaveBeenCalledWith(0);
      expect(hapticEngine.isHapticActive()).toBe(false);
    });

    it('should cancel current haptic when new one is triggered', async () => {
      // Start first haptic
      await hapticEngine.triggerHaptic('ui-button-tap');
      expect(hapticEngine.isHapticActive()).toBe(true);
      
      // Start second haptic (should cancel first)
      await hapticEngine.triggerHaptic('ui-button-press');
      
      // Should have called vibrate to stop (0) and then start new pattern
      expect(mockVibrate).toHaveBeenCalledWith(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle vibrate API errors gracefully', async () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('Vibration failed');
      });
      
      const success = await hapticEngine.triggerHaptic('ui-button-tap');
      
      expect(success).toBe(false);
      expect(hapticEngine.isHapticActive()).toBe(false);
    });

    it('should handle invalid custom patterns', async () => {
      const invalidPattern: any = ['invalid', 'pattern'];
      
      // Should not throw error
      const success = await hapticEngine.triggerCustomHaptic(invalidPattern);
      
      expect(success).toBe(true); // Will still try to vibrate
    });
  });

  describe('Gamepad Haptics', () => {
    it('should attempt gamepad haptics when vibration API is not available', async () => {
      // Remove vibration API but keep gamepad support
      Object.defineProperty(navigator, 'vibrate', { value: undefined });
      
      const mockGamepad = {
        hapticActuators: [{
          pulse: vi.fn().mockResolvedValue(true)
        }]
      };
      mockGetGamepads.mockReturnValue([mockGamepad]);
      
      // Reset singleton
      (HapticEngine as any).instance = undefined;
      const gamepadEngine = HapticEngine.getInstance();
      
      const success = await gamepadEngine.triggerHaptic('ui-button-tap');
      
      expect(success).toBe(true);
      expect(mockGamepad.hapticActuators[0].pulse).toHaveBeenCalled();
    });

    it('should handle gamepad haptics errors gracefully', async () => {
      Object.defineProperty(navigator, 'vibrate', { value: undefined });
      
      const mockGamepad = {
        hapticActuators: [{
          pulse: vi.fn().mockRejectedValue(new Error('Gamepad error'))
        }]
      };
      mockGetGamepads.mockReturnValue([mockGamepad]);
      
      // Reset singleton
      (HapticEngine as any).instance = undefined;
      const gamepadEngine = HapticEngine.getInstance();
      
      const success = await gamepadEngine.triggerHaptic('ui-button-tap');
      
      expect(success).toBe(false);
    });
  });

  describe('Test Functionality', () => {
    it('should provide test haptic function', async () => {
      const success = await hapticEngine.testHaptic();
      
      expect(success).toBe(true);
      expect(mockVibrate).toHaveBeenCalled();
    });
  });
});