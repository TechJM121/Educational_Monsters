import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fadeInUp,
  levelUpAnimation,
  xpGainAnimation,
  getStaggerDelay,
  getRandomDelay,
  respectsReducedMotion,
  animationPresets
} from '../animations';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

describe('Animation Variants', () => {
  it('fadeInUp has correct animation states', () => {
    expect(fadeInUp.initial).toEqual({ opacity: 0, y: 20 });
    expect(fadeInUp.animate).toEqual({ opacity: 1, y: 0 });
    expect(fadeInUp.exit).toEqual({ opacity: 0, y: -20 });
  });

  it('levelUpAnimation has correct keyframes', () => {
    expect(levelUpAnimation.initial).toEqual({ scale: 1, rotate: 0 });
    expect(levelUpAnimation.animate).toEqual({
      scale: [1, 1.2, 1.1, 1],
      rotate: [0, 5, -5, 0]
    });
  });

  it('xpGainAnimation has proper floating effect', () => {
    expect(xpGainAnimation.initial).toEqual({ opacity: 0, y: 0, scale: 0.8 });
    expect(xpGainAnimation.animate).toEqual({
      opacity: [0, 1, 1, 0],
      y: [0, -30, -60, -80],
      scale: [0.8, 1, 1.1, 0.9]
    });
  });
});

describe('Animation Utilities', () => {
  it('getStaggerDelay calculates correct delays', () => {
    expect(getStaggerDelay(0)).toBe(0);
    expect(getStaggerDelay(1)).toBe(0.1);
    expect(getStaggerDelay(2)).toBe(0.2);
    expect(getStaggerDelay(1, 0.2)).toBe(0.2);
  });

  it('getRandomDelay returns value within range', () => {
    const delay = getRandomDelay(0.1, 0.5);
    expect(delay).toBeGreaterThanOrEqual(0.1);
    expect(delay).toBeLessThanOrEqual(0.5);
  });

  it('getRandomDelay uses default range', () => {
    const delay = getRandomDelay();
    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(0.5);
  });
});

describe('Animation Presets', () => {
  it('has correct preset configurations', () => {
    expect(animationPresets.gentle).toEqual({
      duration: 0.3,
      ease: "easeOut"
    });

    expect(animationPresets.bouncy).toEqual({
      type: "spring",
      stiffness: 300,
      damping: 20
    });

    expect(animationPresets.dramatic).toEqual({
      duration: 0.8,
      ease: "easeInOut"
    });
  });
});

describe('Reduced Motion Support', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('respects reduced motion preference', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const animation = { duration: 0.5, ease: "easeOut" };
    const result = respectsReducedMotion(animation);

    expect(result).toEqual({
      duration: 0.5,
      ease: "easeOut",
      transition: { duration: 0 }
    });
  });

  it('preserves animation when reduced motion is not preferred', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const animation = { duration: 0.5, ease: "easeOut" };
    const result = respectsReducedMotion(animation);

    expect(result).toEqual(animation);
  });

  it('handles window not being defined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const animation = { duration: 0.5, ease: "easeOut" };
    const result = respectsReducedMotion(animation);

    expect(result).toEqual(animation);

    global.window = originalWindow;
  });
});

describe('Animation Performance', () => {
  it('animation variants are properly structured for performance', () => {
    // Check that animations use transform properties for better performance
    expect(fadeInUp.initial).toHaveProperty('y');
    expect(fadeInUp.animate).toHaveProperty('y');
    
    expect(levelUpAnimation.initial).toHaveProperty('scale');
    expect(levelUpAnimation.animate).toHaveProperty('scale');
  });

  it('stagger animations have reasonable timing', () => {
    const delays = [0, 1, 2, 3, 4].map(i => getStaggerDelay(i));
    
    // Ensure delays are reasonable for UX (not too slow)
    delays.forEach(delay => {
      expect(delay).toBeLessThan(1); // Less than 1 second
    });
    
    // Ensure delays are progressive
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
  });
});