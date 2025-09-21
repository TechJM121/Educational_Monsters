/**
 * Tests for motion-safe animation utilities
 * Ensures animations respect user motion preferences
 */

import {
  createMotionSafeAnimation,
  getAlternativeIndicator,
  generateAlternativeCSS,
  createMotionVariants,
  shouldDisableAnimation,
  motionSafePresets
} from '../motionSafeAnimations';
import type { MotionPreferences } from '../../hooks/useReducedMotion';

describe('motionSafeAnimations', () => {
  const defaultPreferences: MotionPreferences = {
    prefersReducedMotion: false,
    animationDuration: 1,
    animationIntensity: 1,
    enableMicroAnimations: true,
    enableTransitions: true,
    enableParticles: true,
  };

  const reducedPreferences: MotionPreferences = {
    prefersReducedMotion: true,
    animationDuration: 0.3,
    animationIntensity: 0.2,
    enableMicroAnimations: false,
    enableTransitions: true,
    enableParticles: false,
  };

  describe('createMotionSafeAnimation', () => {
    it('should return default animation for normal preferences', () => {
      const result = createMotionSafeAnimation('buttonHover', defaultPreferences);
      
      expect(result.scale).toBe(1.05);
      expect(result.duration).toBe(0.2);
      expect(result.easing).toBe('easeOut');
    });

    it('should return reduced animation for reduced motion preferences', () => {
      const result = createMotionSafeAnimation('buttonHover', reducedPreferences);
      
      expect(result.scale).toBeCloseTo(1.004); // 1 + (1.02 - 1) * 0.2
      expect(result.duration).toBeCloseTo(0.03); // 0.1 * 0.3
      expect(result.easing).toBe('easeOut');
    });

    it('should apply custom configuration', () => {
      const customConfig = { duration: 0.5, scale: 1.1 };
      const result = createMotionSafeAnimation('buttonHover', defaultPreferences, customConfig);
      
      expect(result.duration).toBe(0.5);
      expect(result.scale).toBe(1.1);
    });

    it('should handle animations with transforms', () => {
      const result = createMotionSafeAnimation('pageTransition', reducedPreferences);
      
      expect(result.x).toBeCloseTo(1); // 5 * 0.2
      expect(result.opacity).toBe(0.5);
      expect(result.duration).toBeCloseTo(0.06); // 0.2 * 0.3
    });

    it('should handle celebration animations', () => {
      const result = createMotionSafeAnimation('celebration', reducedPreferences);
      
      expect(result.scale).toBeCloseTo(1.01); // 1 + (1.05 - 1) * 0.2
      expect(result.rotate).toBe(0); // No rotation in reduced mode
      expect(result.duration).toBeCloseTo(0.09); // 0.3 * 0.3
    });
  });

  describe('getAlternativeIndicator', () => {
    it('should return null for normal preferences', () => {
      const result = getAlternativeIndicator('buttonHover', defaultPreferences);
      expect(result).toBeNull();
    });

    it('should return alternative indicator for reduced motion', () => {
      const result = getAlternativeIndicator('buttonHover', reducedPreferences);
      
      expect(result).toEqual({
        type: 'color',
        intensity: 'medium',
        duration: 0.15
      });
    });

    it('should return alternative indicator for low intensity', () => {
      const lowIntensityPrefs = {
        ...defaultPreferences,
        animationIntensity: 0.2
      };
      
      const result = getAlternativeIndicator('focusRing', lowIntensityPrefs);
      
      expect(result).toEqual({
        type: 'border',
        intensity: 'strong',
        duration: 0.1
      });
    });
  });

  describe('generateAlternativeCSS', () => {
    it('should generate color-based alternative CSS', () => {
      const indicator = { type: 'color' as const, intensity: 'medium' as const, duration: 0.15 };
      const result = generateAlternativeCSS(indicator);
      
      expect(result).toContain('transition-all');
      expect(result).toContain('duration-150');
      expect(result).toContain('hover:bg-blue-100');
    });

    it('should generate border-based alternative CSS', () => {
      const indicator = { type: 'border' as const, intensity: 'strong' as const, duration: 0.1 };
      const result = generateAlternativeCSS(indicator);
      
      expect(result).toContain('hover:border-blue-700');
    });

    it('should generate shadow-based alternative CSS', () => {
      const indicator = { type: 'shadow' as const, intensity: 'subtle' as const, duration: 0.2 };
      const result = generateAlternativeCSS(indicator);
      
      expect(result).toContain('hover:shadow-sm');
    });

    it('should generate size-based alternative CSS', () => {
      const indicator = { type: 'size' as const, intensity: 'medium' as const, duration: 0.15 };
      const result = generateAlternativeCSS(indicator);
      
      expect(result).toContain('hover:scale-102');
    });

    it('should generate opacity-based alternative CSS', () => {
      const indicator = { type: 'opacity' as const, intensity: 'strong' as const, duration: 0.1 };
      const result = generateAlternativeCSS(indicator);
      
      expect(result).toContain('hover:opacity-70');
    });
  });

  describe('createMotionVariants', () => {
    it('should create variants for normal preferences', () => {
      const variants = createMotionVariants(defaultPreferences);
      
      expect(variants.button.hover.scale).toBe(1.05);
      expect(variants.button.tap.scale).toBe(0.95);
      expect(variants.page.initial.x).toBe(20);
      expect(variants.page.animate.transition.duration).toBe(0.3);
    });

    it('should create reduced variants for reduced motion preferences', () => {
      const variants = createMotionVariants(reducedPreferences);
      
      expect(variants.button.hover.scale).toBeCloseTo(1.004);
      expect(variants.button.tap.scale).toBe(0.99);
      expect(variants.page.initial.x).toBe(0);
      expect(variants.page.initial.opacity).toBe(0.8);
      expect(variants.page.animate.transition.duration).toBeCloseTo(0.09);
    });

    it('should handle loading variants', () => {
      const variants = createMotionVariants(reducedPreferences);
      
      expect(variants.loading.animate.scale).toEqual([1, 1, 1]);
      expect(variants.loading.animate.transition.duration).toBeCloseTo(0.45);
    });

    it('should handle celebration variants', () => {
      const variants = createMotionVariants(reducedPreferences);
      
      expect(variants.celebrate.animate.scale).toEqual([1, 1.02, 1]);
      expect(variants.celebrate.animate.rotate).toEqual([0, 0, 0]);
      expect(variants.celebrate.animate.transition.duration).toBeCloseTo(0.18);
    });
  });

  describe('shouldDisableAnimation', () => {
    it('should disable micro animations when preference is false', () => {
      const prefs = { ...defaultPreferences, enableMicroAnimations: false };
      expect(shouldDisableAnimation('micro', prefs)).toBe(true);
    });

    it('should disable transitions when preference is false', () => {
      const prefs = { ...defaultPreferences, enableTransitions: false };
      expect(shouldDisableAnimation('transition', prefs)).toBe(true);
    });

    it('should disable particles when preference is false', () => {
      const prefs = { ...defaultPreferences, enableParticles: false };
      expect(shouldDisableAnimation('particle', prefs)).toBe(true);
    });

    it('should disable celebration for very low intensity reduced motion', () => {
      const prefs = {
        ...reducedPreferences,
        animationIntensity: 0.1
      };
      expect(shouldDisableAnimation('celebration', prefs)).toBe(true);
    });

    it('should not disable animations when preferences allow', () => {
      expect(shouldDisableAnimation('micro', defaultPreferences)).toBe(false);
      expect(shouldDisableAnimation('transition', defaultPreferences)).toBe(false);
      expect(shouldDisableAnimation('particle', defaultPreferences)).toBe(false);
      expect(shouldDisableAnimation('celebration', defaultPreferences)).toBe(false);
    });
  });

  describe('motionSafePresets', () => {
    it('should have all required presets', () => {
      expect(motionSafePresets).toHaveProperty('buttonHover');
      expect(motionSafePresets).toHaveProperty('focusRing');
      expect(motionSafePresets).toHaveProperty('pageTransition');
      expect(motionSafePresets).toHaveProperty('loadingPulse');
      expect(motionSafePresets).toHaveProperty('celebration');
    });

    it('should have consistent structure for all presets', () => {
      Object.values(motionSafePresets).forEach(preset => {
        expect(preset).toHaveProperty('default');
        expect(preset).toHaveProperty('reduced');
        expect(preset).toHaveProperty('alternative');
        
        expect(preset.default).toHaveProperty('duration');
        expect(preset.default).toHaveProperty('easing');
        expect(preset.reduced).toHaveProperty('duration');
        expect(preset.reduced).toHaveProperty('easing');
        
        expect(preset.alternative).toHaveProperty('type');
        expect(preset.alternative).toHaveProperty('intensity');
        expect(preset.alternative).toHaveProperty('duration');
      });
    });

    it('should have reduced animations with shorter durations', () => {
      Object.values(motionSafePresets).forEach(preset => {
        expect(preset.reduced.duration).toBeLessThanOrEqual(preset.default.duration);
      });
    });
  });
});