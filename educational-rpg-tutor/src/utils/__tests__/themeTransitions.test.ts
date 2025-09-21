/**
 * Theme Transition Utilities Tests
 * Tests smooth transitions, color wave effects, and particle effects
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createThemeTransitionStyles,
  ThemeTransitionManager,
  themeTransitionManager,
  createColorWaveEffect,
  createThemeParticleEffect,
} from '../themeTransitions';
import type { ThemeMode } from '../../types/theme';

// Mock DOM methods
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateElement = vi.fn();
const mockGetElementById = vi.fn();

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  configurable: true,
});

Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  configurable: true,
});

Object.defineProperty(document, 'head', {
  value: { appendChild: mockAppendChild },
  configurable: true,
});

Object.defineProperty(document, 'body', {
  value: { appendChild: mockAppendChild, removeChild: mockRemoveChild },
  configurable: true,
});

Object.defineProperty(document, 'documentElement', {
  value: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
  configurable: true,
});

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  configurable: true,
});

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  configurable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

// Mock setTimeout
global.setTimeout = vi.fn((cb, delay) => {
  if (typeof cb === 'function') {
    cb();
  }
  return 1 as any;
});

describe('Theme Transition Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateElement.mockReturnValue({
      className: '',
      style: {
        cssText: '',
      },
      appendChild: mockAppendChild,
      parentNode: { removeChild: mockRemoveChild },
    });
    mockGetElementById.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createThemeTransitionStyles', () => {
    it('should create default transition styles', () => {
      const styles = createThemeTransitionStyles();

      expect(styles).toHaveProperty('transition');
      expect(styles.transition).toContain('background-color');
      expect(styles.transition).toContain('border-color');
      expect(styles.transition).toContain('color');
      expect(styles.transition).toContain('box-shadow');
      expect(styles.transition).toContain('backdrop-filter');
      expect(styles.transition).toContain('500ms');
      expect(styles.transition).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
    });

    it('should create custom transition styles with options', () => {
      const styles = createThemeTransitionStyles({
        duration: 1000,
        easing: 'ease-in-out',
        enableColorWave: true,
      });

      expect(styles.transition).toContain('1000ms');
      expect(styles.transition).toContain('ease-in-out');
      expect(styles).toHaveProperty('position', 'relative');
      expect(styles).toHaveProperty('overflow', 'hidden');
    });

    it('should include will-change property for performance', () => {
      const styles = createThemeTransitionStyles();

      expect(styles).toHaveProperty('willChange');
      expect(styles.willChange).toContain('background-color');
      expect(styles.willChange).toContain('border-color');
      expect(styles.willChange).toContain('color');
      expect(styles.willChange).toContain('box-shadow');
    });
  });

  describe('ThemeTransitionManager', () => {
    let manager: ThemeTransitionManager;

    beforeEach(() => {
      manager = new ThemeTransitionManager();
    });

    it('should initialize with default state', () => {
      const state = manager.getState();

      expect(state.isTransitioning).toBe(false);
      expect(state.fromMode).toBe(null);
      expect(state.toMode).toBe(null);
      expect(state.progress).toBe(0);
    });

    it('should start transition and update state', async () => {
      const transitionPromise = manager.startTransition('light', 'dark', 100);

      // Check initial transition state
      let state = manager.getState();
      expect(state.isTransitioning).toBe(true);
      expect(state.fromMode).toBe('light');
      expect(state.toMode).toBe('dark');
      expect(state.progress).toBe(0);

      // Wait for transition to complete
      await transitionPromise;

      // Check final state
      state = manager.getState();
      expect(state.isTransitioning).toBe(false);
      expect(state.progress).toBe(1);
    });

    it('should add and remove transition class from document', async () => {
      const mockClassList = {
        add: vi.fn(),
        remove: vi.fn(),
      };

      Object.defineProperty(document.documentElement, 'classList', {
        value: mockClassList,
        configurable: true,
      });

      await manager.startTransition('light', 'dark', 50);

      expect(mockClassList.add).toHaveBeenCalledWith('theme-transitioning');
      expect(mockClassList.remove).toHaveBeenCalledWith('theme-transitioning');
    });

    it('should notify subscribers of state changes', async () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      await manager.startTransition('light', 'dark', 50);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          isTransitioning: true,
          fromMode: 'light',
          toMode: 'dark',
        })
      );

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          isTransitioning: false,
          progress: 1,
        })
      );

      unsubscribe();
    });

    it('should allow unsubscribing from state changes', () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribe(listener);

      unsubscribe();

      manager.startTransition('light', 'dark', 50);

      // Listener should not be called after unsubscribing
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Global Theme Transition Manager', () => {
    it('should provide a global instance', () => {
      expect(themeTransitionManager).toBeInstanceOf(ThemeTransitionManager);
    });

    it('should maintain state across multiple calls', async () => {
      const listener = vi.fn();
      themeTransitionManager.subscribe(listener);

      await themeTransitionManager.startTransition('light', 'dark', 50);

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('createColorWaveEffect', () => {
    it('should create and append color wave element', () => {
      createColorWaveEffect('#ffffff', '#000000', 1000);

      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should set correct styles on wave element', () => {
      const mockElement = {
        className: '',
        style: { cssText: '' },
        parentNode: { removeChild: mockRemoveChild },
      };
      mockCreateElement.mockReturnValue(mockElement);

      createColorWaveEffect('#ffffff', '#000000', 1000);

      expect(mockElement.className).toBe('theme-color-wave');
      expect(mockElement.style.cssText).toContain('linear-gradient(45deg, #ffffff, #000000)');
      expect(mockElement.style.cssText).toContain('animation: colorWave 1000ms');
    });

    it('should create keyframes style if not present', () => {
      mockGetElementById.mockReturnValue(null); // No existing keyframes

      createColorWaveEffect('#ffffff', '#000000');

      expect(mockCreateElement).toHaveBeenCalledWith('style');
      expect(mockAppendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'color-wave-keyframes',
        })
      );
    });

    it('should not create keyframes if already present', () => {
      mockGetElementById.mockReturnValue({ id: 'color-wave-keyframes' }); // Existing keyframes

      createColorWaveEffect('#ffffff', '#000000');

      // Should not create new style element for keyframes
      expect(mockCreateElement).toHaveBeenCalledTimes(1); // Only the wave element
    });

    it('should remove wave element after animation', () => {
      const mockElement = {
        className: 'theme-color-wave',
        style: { cssText: '' },
        parentNode: { removeChild: mockRemoveChild },
      };
      mockCreateElement.mockReturnValue(mockElement);

      createColorWaveEffect('#ffffff', '#000000', 1000);

      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('createThemeParticleEffect', () => {
    it('should create particle container and particles', () => {
      createThemeParticleEffect('#ffffff', '#000000', 5);

      // Should create container + 5 particles
      expect(mockCreateElement).toHaveBeenCalledTimes(6);
      expect(mockAppendChild).toHaveBeenCalledTimes(6); // 5 particles to container + container to body
    });

    it('should set correct styles on particle container', () => {
      const mockContainer = {
        className: '',
        style: { cssText: '' },
        appendChild: mockAppendChild,
        parentNode: { removeChild: mockRemoveChild },
      };
      mockCreateElement.mockReturnValueOnce(mockContainer);

      createThemeParticleEffect('#ffffff', '#000000', 1);

      expect(mockContainer.className).toBe('theme-particles');
      expect(mockContainer.style.cssText).toContain('position: fixed');
      expect(mockContainer.style.cssText).toContain('width: 100vw');
      expect(mockContainer.style.cssText).toContain('height: 100vh');
    });

    it('should create particles with random properties', () => {
      const mockParticles: any[] = [];
      mockCreateElement.mockImplementation(() => {
        const particle = {
          className: '',
          style: { cssText: '' },
        };
        mockParticles.push(particle);
        return particle;
      });

      createThemeParticleEffect('#ffffff', '#000000', 3);

      // Check that particles have different properties (due to randomness)
      const particles = mockParticles.slice(1); // Skip container
      expect(particles).toHaveLength(3);
      
      particles.forEach(particle => {
        expect(particle.className).toBe('theme-particle');
        expect(particle.style.cssText).toContain('position: absolute');
        expect(particle.style.cssText).toContain('border-radius: 50%');
        expect(particle.style.cssText).toContain('animation: themeParticle');
      });
    });

    it('should create keyframes for particles if not present', () => {
      mockGetElementById.mockReturnValue(null);

      createThemeParticleEffect('#ffffff', '#000000', 1);

      expect(mockCreateElement).toHaveBeenCalledWith('style');
      expect(mockAppendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'theme-particle-keyframes',
        })
      );
    });

    it('should remove particle container after animation', () => {
      const mockContainer = {
        className: 'theme-particles',
        style: { cssText: '' },
        appendChild: mockAppendChild,
        parentNode: { removeChild: mockRemoveChild },
      };
      mockCreateElement.mockReturnValueOnce(mockContainer);

      createThemeParticleEffect('#ffffff', '#000000', 1);

      expect(mockRemoveChild).toHaveBeenCalledWith(mockContainer);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing parentNode gracefully in color wave', () => {
      const mockElement = {
        className: 'theme-color-wave',
        style: { cssText: '' },
        parentNode: null, // No parent node
      };
      mockCreateElement.mockReturnValue(mockElement);

      expect(() => {
        createColorWaveEffect('#ffffff', '#000000');
      }).not.toThrow();
    });

    it('should handle missing parentNode gracefully in particle effect', () => {
      const mockContainer = {
        className: 'theme-particles',
        style: { cssText: '' },
        appendChild: mockAppendChild,
        parentNode: null, // No parent node
      };
      mockCreateElement.mockReturnValueOnce(mockContainer);

      expect(() => {
        createThemeParticleEffect('#ffffff', '#000000', 1);
      }).not.toThrow();
    });

    it('should handle transition manager with zero duration', async () => {
      const manager = new ThemeTransitionManager();
      
      await manager.startTransition('light', 'dark', 0);
      
      const state = manager.getState();
      expect(state.isTransitioning).toBe(false);
      expect(state.progress).toBe(1);
    });

    it('should handle multiple rapid transitions', async () => {
      const manager = new ThemeTransitionManager();
      
      // Start multiple transitions rapidly
      const promise1 = manager.startTransition('light', 'dark', 100);
      const promise2 = manager.startTransition('dark', 'light', 100);
      
      await Promise.all([promise1, promise2]);
      
      const state = manager.getState();
      expect(state.isTransitioning).toBe(false);
    });
  });
});