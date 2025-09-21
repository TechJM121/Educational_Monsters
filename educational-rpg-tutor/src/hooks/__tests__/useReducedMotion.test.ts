/**
 * Tests for useReducedMotion hook
 * Ensures proper detection and handling of motion preferences
 */

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useReducedMotion, getMotionSafeProps, getMotionCSSVars } from '../useReducedMotion';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  const mockMediaQuery = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => mockMediaQuery),
  });

  return mockMediaQuery;
};

// Mock localStorage
const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
    },
    writable: true,
  });

  return store;
};

describe('useReducedMotion', () => {
  let mockMediaQuery: any;
  let localStorageStore: any;

  beforeEach(() => {
    mockMediaQuery = mockMatchMedia(false);
    localStorageStore = mockLocalStorage();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default preferences when no system preference', () => {
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.shouldReduceMotion).toBe(false);
      expect(result.current.animationDuration).toBe(1);
      expect(result.current.animationIntensity).toBe(1);
      expect(result.current.enableMicroAnimations).toBe(true);
      expect(result.current.enableTransitions).toBe(true);
      expect(result.current.enableParticles).toBe(true);
    });

    it('should initialize with reduced motion when system prefers reduced motion', () => {
      mockMatchMedia(true);
      
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.shouldReduceMotion).toBe(true);
      expect(result.current.animationDuration).toBe(0.3);
      expect(result.current.animationIntensity).toBe(0.2);
      expect(result.current.enableMicroAnimations).toBe(false);
      expect(result.current.enableParticles).toBe(false);
    });

    it('should load saved preferences from localStorage', () => {
      const savedPreferences = {
        prefersReducedMotion: false,
        animationDuration: 0.8,
        animationIntensity: 0.6,
        enableMicroAnimations: false,
        enableTransitions: true,
        enableParticles: true,
      };

      localStorageStore['motion-preferences'] = JSON.stringify(savedPreferences);
      
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.animationDuration).toBe(0.8);
      expect(result.current.animationIntensity).toBe(0.6);
      expect(result.current.enableMicroAnimations).toBe(false);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorageStore['motion-preferences'] = 'invalid-json';
      
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.shouldReduceMotion).toBe(false);
      expect(result.current.animationDuration).toBe(1);
    });
  });

  describe('system preference changes', () => {
    it('should update preferences when system preference changes', () => {
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.shouldReduceMotion).toBe(false);

      // Simulate system preference change
      act(() => {
        const changeEvent = new Event('change') as any;
        changeEvent.matches = true;
        mockMediaQuery.addEventListener.mock.calls[0][1](changeEvent);
      });

      expect(result.current.shouldReduceMotion).toBe(true);
      expect(result.current.animationDuration).toBeLessThanOrEqual(0.5);
      expect(result.current.enableMicroAnimations).toBe(false);
      expect(result.current.enableParticles).toBe(false);
    });
  });

  describe('controls', () => {
    it('should update animation duration within valid range', () => {
      const { result } = renderHook(() => useReducedMotion());

      act(() => {
        result.current.controls.setAnimationDuration(1.5);
      });

      expect(result.current.animationDuration).toBe(1.5);

      // Test bounds
      act(() => {
        result.current.controls.setAnimationDuration(3); // Above max
      });

      expect(result.current.animationDuration).toBe(2); // Clamped to max

      act(() => {
        result.current.controls.setAnimationDuration(0.05); // Below min
      });

      expect(result.current.animationDuration).toBe(0.1); // Clamped to min
    });

    it('should update animation intensity within valid range', () => {
      const { result } = renderHook(() => useReducedMotion());

      act(() => {
        result.current.controls.setAnimationIntensity(0.7);
      });

      expect(result.current.animationIntensity).toBe(0.7);

      // Test bounds
      act(() => {
        result.current.controls.setAnimationIntensity(1.5); // Above max
      });

      expect(result.current.animationIntensity).toBe(1); // Clamped to max

      act(() => {
        result.current.controls.setAnimationIntensity(-0.1); // Below min
      });

      expect(result.current.animationIntensity).toBe(0); // Clamped to min
    });

    it('should toggle micro animations', () => {
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.enableMicroAnimations).toBe(true);

      act(() => {
        result.current.controls.toggleMicroAnimations();
      });

      expect(result.current.enableMicroAnimations).toBe(false);

      act(() => {
        result.current.controls.toggleMicroAnimations();
      });

      expect(result.current.enableMicroAnimations).toBe(true);
    });

    it('should toggle transitions', () => {
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.enableTransitions).toBe(true);

      act(() => {
        result.current.controls.toggleTransitions();
      });

      expect(result.current.enableTransitions).toBe(false);
    });

    it('should toggle particles', () => {
      const { result } = renderHook(() => useReducedMotion());

      expect(result.current.enableParticles).toBe(true);

      act(() => {
        result.current.controls.toggleParticles();
      });

      expect(result.current.enableParticles).toBe(false);
    });

    it('should reset to defaults based on system preference', () => {
      const { result } = renderHook(() => useReducedMotion());

      // Modify preferences
      act(() => {
        result.current.controls.setAnimationDuration(0.5);
        result.current.controls.setAnimationIntensity(0.3);
        result.current.controls.toggleMicroAnimations();
      });

      expect(result.current.animationDuration).toBe(0.5);
      expect(result.current.enableMicroAnimations).toBe(false);

      // Reset to defaults
      act(() => {
        result.current.controls.resetToDefaults();
      });

      expect(result.current.animationDuration).toBe(1);
      expect(result.current.enableMicroAnimations).toBe(true);
    });
  });

  describe('localStorage persistence', () => {
    it('should save preferences to localStorage', () => {
      const { result } = renderHook(() => useReducedMotion());

      act(() => {
        result.current.controls.setAnimationDuration(0.8);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'motion-preferences',
        expect.stringContaining('"animationDuration":0.8')
      );
    });
  });
});

describe('getMotionSafeProps', () => {
  it('should return original props when motion is not reduced', () => {
    const baseProps = {
      animate: { scale: 1.2, rotate: 10, x: 20 },
      transition: { duration: 0.5 }
    };

    const preferences = {
      prefersReducedMotion: false,
      animationDuration: 1,
      animationIntensity: 1,
      enableMicroAnimations: true,
      enableTransitions: true,
      enableParticles: true,
    };

    const result = getMotionSafeProps(baseProps, preferences);

    expect(result).toEqual(baseProps);
  });

  it('should modify props when motion is reduced', () => {
    const baseProps = {
      animate: { scale: 1.2, rotate: 10, x: 20 },
      transition: { duration: 0.5 }
    };

    const preferences = {
      prefersReducedMotion: true,
      animationDuration: 0.5,
      animationIntensity: 0.3,
      enableMicroAnimations: false,
      enableTransitions: true,
      enableParticles: false,
    };

    const result = getMotionSafeProps(baseProps, preferences);

    expect(result.transition.duration).toBe(0.25); // 0.5 * 0.5
    expect(result.transition.type).toBe('tween');
    expect(result.animate.scale).toBeCloseTo(1.06); // 1 + (1.2 - 1) * 0.3
    expect(result.animate.rotate).toBeCloseTo(3); // 10 * 0.3
    expect(result.animate.x).toBeCloseTo(6); // 20 * 0.3
  });
});

describe('getMotionCSSVars', () => {
  it('should generate correct CSS custom properties', () => {
    const preferences = {
      prefersReducedMotion: true,
      animationDuration: 0.8,
      animationIntensity: 0.6,
      enableMicroAnimations: false,
      enableTransitions: true,
      enableParticles: false,
    };

    const result = getMotionCSSVars(preferences);

    expect(result).toEqual({
      '--animation-duration-multiplier': '0.8',
      '--animation-intensity-multiplier': '0.6',
      '--enable-micro-animations': '0',
      '--enable-transitions': '1',
      '--enable-particles': '0',
    });
  });
});