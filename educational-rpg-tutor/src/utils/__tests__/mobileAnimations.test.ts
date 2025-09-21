import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isMobile,
  isTouchDevice,
  getDevicePerformanceTier,
  getAdaptiveAnimationConfig,
  triggerHaptic,
  hapticPatterns
} from '../mobileAnimations';

// Mock navigator properties
const mockNavigator = {
  userAgent: '',
  maxTouchPoints: 0,
  deviceMemory: 4,
  hardwareConcurrency: 4,
  connection: null,
  vibrate: vi.fn()
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Mock window properties
const mockWindow = {
  innerWidth: 1024,
  ontouchstart: undefined
};

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('mobileAnimations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default values
    mockNavigator.userAgent = '';
    mockNavigator.maxTouchPoints = 0;
    mockNavigator.deviceMemory = 4;
    mockNavigator.hardwareConcurrency = 4;
    mockNavigator.connection = null;
    mockWindow.innerWidth = 1024;
    mockWindow.ontouchstart = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isMobile', () => {
    it('should detect mobile user agents', () => {
      const mobileUserAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (Android 10; Mobile; rv:81.0)',
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
        'Mozilla/5.0 (Linux; Android 10; SM-G975F)'
      ];

      mobileUserAgents.forEach(userAgent => {
        mockNavigator.userAgent = userAgent;
        expect(isMobile()).toBe(true);
      });
    });

    it('should detect desktop user agents', () => {
      const desktopUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      ];

      desktopUserAgents.forEach(userAgent => {
        mockNavigator.userAgent = userAgent;
        mockWindow.innerWidth = 1200;
        expect(isMobile()).toBe(false);
      });
    });

    it('should detect mobile based on screen width', () => {
      mockNavigator.userAgent = 'Desktop Browser';
      mockWindow.innerWidth = 600;
      expect(isMobile()).toBe(true);

      mockWindow.innerWidth = 800;
      expect(isMobile()).toBe(false);
    });

    it('should handle undefined window', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(isMobile()).toBe(false);
      
      global.window = originalWindow;
    });
  });

  describe('isTouchDevice', () => {
    it('should detect touch support via ontouchstart', () => {
      mockWindow.ontouchstart = null;
      expect(isTouchDevice()).toBe(true);

      mockWindow.ontouchstart = undefined;
      expect(isTouchDevice()).toBe(false);
    });

    it('should detect touch support via maxTouchPoints', () => {
      mockNavigator.maxTouchPoints = 5;
      expect(isTouchDevice()).toBe(true);

      mockNavigator.maxTouchPoints = 0;
      expect(isTouchDevice()).toBe(false);
    });

    it('should handle undefined window', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(isTouchDevice()).toBe(false);
      
      global.window = originalWindow;
    });
  });

  describe('getDevicePerformanceTier', () => {
    it('should return high tier for powerful devices', () => {
      mockNavigator.deviceMemory = 16;
      mockNavigator.hardwareConcurrency = 12;
      mockNavigator.connection = { effectiveType: '4g' };

      expect(getDevicePerformanceTier()).toBe('high');
    });

    it('should return low tier for weak devices', () => {
      mockNavigator.deviceMemory = 1;
      mockNavigator.hardwareConcurrency = 1;
      mockNavigator.connection = { effectiveType: 'slow-2g' };

      expect(getDevicePerformanceTier()).toBe('low');
    });

    it('should return low tier for slow network', () => {
      mockNavigator.deviceMemory = 8;
      mockNavigator.hardwareConcurrency = 8;
      mockNavigator.connection = { effectiveType: '2g' };

      expect(getDevicePerformanceTier()).toBe('low');
    });

    it('should return medium tier for average devices', () => {
      mockNavigator.deviceMemory = 4;
      mockNavigator.hardwareConcurrency = 4;
      mockNavigator.connection = { effectiveType: '3g' };

      expect(getDevicePerformanceTier()).toBe('medium');
    });

    it('should handle missing device memory', () => {
      mockNavigator.deviceMemory = undefined as any;
      mockNavigator.hardwareConcurrency = 4;

      expect(getDevicePerformanceTier()).toBe('medium');
    });

    it('should handle missing hardware concurrency', () => {
      mockNavigator.deviceMemory = 4;
      mockNavigator.hardwareConcurrency = undefined as any;

      expect(getDevicePerformanceTier()).toBe('medium');
    });

    it('should handle undefined window', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      expect(getDevicePerformanceTier()).toBe('medium');
      
      global.window = originalWindow;
    });
  });

  describe('getAdaptiveAnimationConfig', () => {
    it('should disable features on low-end devices', () => {
      mockNavigator.deviceMemory = 1;
      mockNavigator.hardwareConcurrency = 1;
      mockNavigator.userAgent = 'Mobile';
      mockWindow.innerWidth = 400;

      const config = getAdaptiveAnimationConfig();

      expect(config.enableParticles).toBe(false);
      expect(config.enableBlur).toBe(false);
      expect(config.enableShadows).toBe(false);
      expect(config.durationMultiplier).toBe(0.7);
      expect(config.staggerDelay).toBe(0.05);
    });

    it('should enable all features on high-end devices', () => {
      mockNavigator.deviceMemory = 16;
      mockNavigator.hardwareConcurrency = 12;
      mockNavigator.userAgent = 'Desktop';
      mockWindow.innerWidth = 1920;

      const config = getAdaptiveAnimationConfig();

      expect(config.enableParticles).toBe(true);
      expect(config.enableBlur).toBe(true);
      expect(config.enableShadows).toBe(true);
      expect(config.durationMultiplier).toBe(1);
      expect(config.staggerDelay).toBe(0.1);
    });

    it('should use medium settings for average devices', () => {
      mockNavigator.deviceMemory = 4;
      mockNavigator.hardwareConcurrency = 4;
      mockNavigator.userAgent = 'Desktop';
      mockWindow.innerWidth = 1200;

      const config = getAdaptiveAnimationConfig();

      expect(config.enableParticles).toBe(true);
      expect(config.enableBlur).toBe(false);
      expect(config.enableShadows).toBe(true);
      expect(config.durationMultiplier).toBe(1);
      expect(config.staggerDelay).toBe(0.1);
    });
  });

  describe('triggerHaptic', () => {
    it('should trigger vibration with correct patterns', () => {
      mockNavigator.maxTouchPoints = 5; // Make it a touch device

      triggerHaptic('light');
      expect(mockNavigator.vibrate).toHaveBeenCalledWith([10]);

      triggerHaptic('medium');
      expect(mockNavigator.vibrate).toHaveBeenCalledWith([20]);

      triggerHaptic('heavy');
      expect(mockNavigator.vibrate).toHaveBeenCalledWith([30]);

      triggerHaptic('success');
      expect(mockNavigator.vibrate).toHaveBeenCalledWith([10, 50, 10]);

      triggerHaptic('error');
      expect(mockNavigator.vibrate).toHaveBeenCalledWith([50, 100, 50]);

      triggerHaptic('warning');
      expect(mockNavigator.vibrate).toHaveBeenCalledWith([20, 50, 20]);
    });

    it('should not trigger vibration on non-touch devices', () => {
      mockNavigator.maxTouchPoints = 0;
      mockWindow.ontouchstart = undefined;

      triggerHaptic('light');
      expect(mockNavigator.vibrate).not.toHaveBeenCalled();
    });

    it('should handle missing vibrate API', () => {
      mockNavigator.maxTouchPoints = 5;
      mockNavigator.vibrate = undefined as any;

      expect(() => triggerHaptic('light')).not.toThrow();
    });

    it('should default to light pattern', () => {
      mockNavigator.maxTouchPoints = 5;

      triggerHaptic();
      expect(mockNavigator.vibrate).toHaveBeenCalledWith([10]);
    });
  });

  describe('hapticPatterns', () => {
    it('should have correct pattern definitions', () => {
      expect(hapticPatterns.light).toEqual([10]);
      expect(hapticPatterns.medium).toEqual([20]);
      expect(hapticPatterns.heavy).toEqual([30]);
      expect(hapticPatterns.success).toEqual([10, 50, 10]);
      expect(hapticPatterns.error).toEqual([50, 100, 50]);
      expect(hapticPatterns.warning).toEqual([20, 50, 20]);
    });
  });

  describe('performance monitoring', () => {
    it('should handle performance monitoring setup', () => {
      // Mock performance API
      const mockPerformance = {
        now: vi.fn(() => Date.now())
      };
      
      Object.defineProperty(global, 'performance', {
        value: mockPerformance,
        writable: true
      });

      // Mock requestAnimationFrame
      global.requestAnimationFrame = vi.fn((callback) => {
        setTimeout(callback, 16);
        return 1;
      });

      // Import and test the monitoring function
      const { monitorAnimationPerformance } = require('../mobileAnimations');
      
      expect(() => monitorAnimationPerformance()).not.toThrow();
    });
  });
});