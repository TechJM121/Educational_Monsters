/**
 * Contrast Validation Tests
 * Tests for WCAG compliance and accessibility utilities
 */

import { vi } from 'vitest';
import {
  hexToRgb,
  getLuminance,
  getContrastRatio,
  validateContrast,
  analyzeColorAccessibility,
  generateAccessibleVariations,
  validateThemePalette,
  detectSystemTheme,
  prefersReducedMotion,
  prefersHighContrast,
} from '../contrastValidation';

describe('Color Conversion Utilities', () => {
  describe('hexToRgb', () => {
    test('converts valid hex colors to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 }); // Without #
    });

    test('returns null for invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#gggggg')).toBeNull();
      expect(hexToRgb('#fff')).toBeNull(); // Short hex not supported
    });
  });

  describe('getLuminance', () => {
    test('calculates correct luminance values', () => {
      // White should have luminance of 1
      expect(getLuminance(255, 255, 255)).toBeCloseTo(1, 2);
      
      // Black should have luminance of 0
      expect(getLuminance(0, 0, 0)).toBeCloseTo(0, 2);
      
      // Gray should be in between
      const grayLuminance = getLuminance(128, 128, 128);
      expect(grayLuminance).toBeGreaterThan(0);
      expect(grayLuminance).toBeLessThan(1);
    });

    test('handles sRGB gamma correction', () => {
      // Test values that require gamma correction
      const lowValue = getLuminance(10, 10, 10);
      const highValue = getLuminance(200, 200, 200);
      
      expect(lowValue).toBeGreaterThan(0);
      expect(highValue).toBeLessThan(1);
      expect(highValue).toBeGreaterThan(lowValue);
    });
  });
});

describe('Contrast Ratio Calculations', () => {
  describe('getContrastRatio', () => {
    test('calculates correct contrast ratios for known color pairs', () => {
      // White on black should be 21:1 (maximum contrast)
      expect(getContrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
      
      // Same colors should be 1:1 (no contrast)
      expect(getContrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 1);
      expect(getContrastRatio('#000000', '#000000')).toBeCloseTo(1, 1);
      
      // Order shouldn't matter
      const ratio1 = getContrastRatio('#ff0000', '#0000ff');
      const ratio2 = getContrastRatio('#0000ff', '#ff0000');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });

    test('throws error for invalid colors', () => {
      expect(() => getContrastRatio('invalid', '#ffffff')).toThrow();
      expect(() => getContrastRatio('#ffffff', 'invalid')).toThrow();
    });
  });

  describe('validateContrast', () => {
    test('correctly validates WCAG AA compliance for normal text', () => {
      // High contrast should pass AAA
      const highContrast = validateContrast('#000000', '#ffffff');
      expect(highContrast.level).toBe('AAA');
      expect(highContrast.isAccessible).toBe(true);
      expect(highContrast.ratio).toBeCloseTo(21, 1);

      // Medium contrast should pass AA (adjust color for proper test)
      const mediumContrast = validateContrast('#767676', '#ffffff');
      expect(mediumContrast.level).toBe('AA');
      expect(mediumContrast.isAccessible).toBe(true);

      // Low contrast should fail
      const lowContrast = validateContrast('#cccccc', '#ffffff');
      expect(lowContrast.level).toBe('FAIL');
      expect(lowContrast.isAccessible).toBe(false);
      expect(lowContrast.recommendation).toContain('fails accessibility standards');
    });

    test('correctly validates WCAG compliance for large text', () => {
      // Lower contrast requirements for large text (use a color that meets 3:1 but not 4.5:1)
      const largeTextContrast = validateContrast('#949494', '#ffffff', true);
      expect(largeTextContrast.isAccessible).toBe(true);
      
      // Same color pair should fail for normal text
      const normalTextContrast = validateContrast('#949494', '#ffffff', false);
      expect(normalTextContrast.isAccessible).toBe(false);
    });

    test('provides helpful recommendations', () => {
      const result = validateContrast('#999999', '#ffffff');
      expect(result.recommendation).toBeDefined();
      expect(result.recommendation).toContain('Contrast ratio');
    });
  });
});

describe('Color Accessibility Analysis', () => {
  describe('analyzeColorAccessibility', () => {
    test('analyzes color properties correctly', () => {
      const whiteAnalysis = analyzeColorAccessibility('#ffffff');
      expect(whiteAnalysis.recommendedTextColor).toBe('black');
      expect(whiteAnalysis.contrastWithBlack).toBeCloseTo(21, 1);
      expect(whiteAnalysis.contrastWithWhite).toBeCloseTo(1, 1);

      const blackAnalysis = analyzeColorAccessibility('#000000');
      expect(blackAnalysis.recommendedTextColor).toBe('white');
      expect(blackAnalysis.contrastWithWhite).toBeCloseTo(21, 1);
      expect(blackAnalysis.contrastWithBlack).toBeCloseTo(1, 1);
    });

    test('provides correct RGB values', () => {
      const analysis = analyzeColorAccessibility('#ff0000');
      expect(analysis.rgb).toEqual({ r: 255, g: 0, b: 0 });
      expect(analysis.hex).toBe('#ff0000');
    });
  });

  describe('generateAccessibleVariations', () => {
    test('generates variations that meet contrast requirements', () => {
      const variations = generateAccessibleVariations('#ff0000', '#ffffff', 4.5);
      
      // All variations should meet the minimum contrast requirement
      variations.forEach(variation => {
        const contrast = getContrastRatio(variation, '#ffffff');
        expect(contrast).toBeGreaterThanOrEqual(4.5);
      });
    });

    test('returns variations sorted by contrast ratio', () => {
      const variations = generateAccessibleVariations('#0000ff', '#ffffff', 3);
      
      if (variations.length > 1) {
        for (let i = 0; i < variations.length - 1; i++) {
          const contrast1 = getContrastRatio(variations[i], '#ffffff');
          const contrast2 = getContrastRatio(variations[i + 1], '#ffffff');
          expect(contrast1).toBeGreaterThanOrEqual(contrast2);
        }
      }
    });
  });
});

describe('Theme Validation', () => {
  describe('validateThemePalette', () => {
    test('validates light theme colors', () => {
      const lightColors = {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#8b5cf6',
      };

      const results = validateThemePalette(lightColors, false);
      
      Object.values(results).forEach(result => {
        expect(result.ratio).toBeGreaterThan(1);
        expect(['AAA', 'AA', 'A', 'FAIL']).toContain(result.level);
      });
    });

    test('validates dark theme colors', () => {
      const darkColors = {
        primary: '#60a5fa',
        secondary: '#94a3b8',
        accent: '#a78bfa',
      };

      const results = validateThemePalette(darkColors, true);
      
      Object.values(results).forEach(result => {
        expect(result.ratio).toBeGreaterThan(1);
        expect(['AAA', 'AA', 'A', 'FAIL']).toContain(result.level);
      });
    });
  });
});

describe('System Preference Detection', () => {
  // Mock window.matchMedia for testing
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  };

  describe('detectSystemTheme', () => {
    test('detects dark theme preference', () => {
      mockMatchMedia(true);
      expect(detectSystemTheme()).toBe('dark');
    });

    test('detects light theme preference', () => {
      mockMatchMedia(false);
      expect(detectSystemTheme()).toBe('light');
    });
  });

  describe('prefersReducedMotion', () => {
    test('detects reduced motion preference', () => {
      mockMatchMedia(true);
      expect(prefersReducedMotion()).toBe(true);
    });

    test('detects no reduced motion preference', () => {
      mockMatchMedia(false);
      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('prefersHighContrast', () => {
    test('detects high contrast preference', () => {
      mockMatchMedia(true);
      expect(prefersHighContrast()).toBe(true);
    });

    test('detects no high contrast preference', () => {
      mockMatchMedia(false);
      expect(prefersHighContrast()).toBe(false);
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles SSR environment gracefully', () => {
    // Mock undefined window
    const originalWindow = global.window;
    delete (global as any).window;

    expect(detectSystemTheme()).toBe('light');
    expect(prefersReducedMotion()).toBe(false);
    expect(prefersHighContrast()).toBe(false);

    // Restore window
    global.window = originalWindow;
  });

  test('handles invalid color formats gracefully', () => {
    expect(() => analyzeColorAccessibility('invalid')).toThrow();
    expect(() => generateAccessibleVariations('invalid', '#ffffff')).toThrow();
  });

  test('handles extreme contrast ratios', () => {
    // Test with very similar colors
    const result = validateContrast('#ffffff', '#fefefe');
    expect(result.ratio).toBeGreaterThan(1);
    expect(result.ratio).toBeLessThan(1.1);
  });
});