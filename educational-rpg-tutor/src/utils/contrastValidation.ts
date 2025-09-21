/**
 * Contrast Validation Utilities
 * Provides WCAG-compliant contrast ratio validation and color accessibility checks
 */

export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  isAccessible: boolean;
  recommendation?: string;
}

export interface ColorAccessibility {
  hex: string;
  rgb: { r: number; g: number; b: number };
  luminance: number;
  contrastWithWhite: number;
  contrastWithBlack: number;
  recommendedTextColor: 'white' | 'black';
}

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to relative luminance
 * Based on WCAG 2.1 specification
 */
export const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Please use hex colors.');
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Validate contrast ratio against WCAG standards
 */
export const validateContrast = (
  foreground: string, 
  background: string, 
  isLargeText: boolean = false
): ContrastResult => {
  const ratio = getContrastRatio(foreground, background);
  
  // WCAG 2.1 requirements
  const normalTextAA = 4.5;
  const normalTextAAA = 7;
  const largeTextAA = 3;
  const largeTextAAA = 4.5;
  
  const requiredAA = isLargeText ? largeTextAA : normalTextAA;
  const requiredAAA = isLargeText ? largeTextAAA : normalTextAAA;
  
  let level: ContrastResult['level'];
  let recommendation: string | undefined;
  
  if (ratio >= requiredAAA) {
    level = 'AAA';
  } else if (ratio >= requiredAA) {
    level = 'AA';
  } else if (ratio >= 3) {
    level = 'A';
    recommendation = `Contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA standards. Consider using a ${ratio < requiredAA ? 'darker' : 'lighter'} color.`;
  } else {
    level = 'FAIL';
    recommendation = `Contrast ratio ${ratio.toFixed(2)}:1 fails accessibility standards. Please choose colors with higher contrast.`;
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    isAccessible: ratio >= requiredAA,
    recommendation
  };
};

/**
 * Analyze color accessibility properties
 */
export const analyzeColorAccessibility = (color: string): ColorAccessibility => {
  const rgb = hexToRgb(color);
  if (!rgb) {
    throw new Error('Invalid color format. Please use hex colors.');
  }
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWithWhite = getContrastRatio(color, '#ffffff');
  const contrastWithBlack = getContrastRatio(color, '#000000');
  
  return {
    hex: color,
    rgb,
    luminance,
    contrastWithWhite,
    contrastWithBlack,
    recommendedTextColor: contrastWithWhite > contrastWithBlack ? 'white' : 'black'
  };
};

/**
 * Generate accessible color variations
 */
export const generateAccessibleVariations = (
  baseColor: string,
  targetBackground: string,
  minContrast: number = 4.5
): string[] => {
  const variations: string[] = [];
  const baseRgb = hexToRgb(baseColor);
  
  if (!baseRgb) {
    throw new Error('Invalid base color format.');
  }
  
  // Generate lighter and darker variations
  for (let i = 0; i <= 100; i += 5) {
    const factor = i / 100;
    
    // Lighter variation
    const lighterR = Math.min(255, Math.round(baseRgb.r + (255 - baseRgb.r) * factor));
    const lighterG = Math.min(255, Math.round(baseRgb.g + (255 - baseRgb.g) * factor));
    const lighterB = Math.min(255, Math.round(baseRgb.b + (255 - baseRgb.b) * factor));
    const lighterHex = `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
    
    // Darker variation
    const darkerR = Math.max(0, Math.round(baseRgb.r * (1 - factor)));
    const darkerG = Math.max(0, Math.round(baseRgb.g * (1 - factor)));
    const darkerB = Math.max(0, Math.round(baseRgb.b * (1 - factor)));
    const darkerHex = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    
    // Check if variations meet contrast requirements
    if (getContrastRatio(lighterHex, targetBackground) >= minContrast) {
      variations.push(lighterHex);
    }
    
    if (getContrastRatio(darkerHex, targetBackground) >= minContrast) {
      variations.push(darkerHex);
    }
  }
  
  // Remove duplicates and sort by contrast ratio
  const uniqueVariations = [...new Set(variations)];
  return uniqueVariations.sort((a, b) => 
    getContrastRatio(b, targetBackground) - getContrastRatio(a, targetBackground)
  );
};

/**
 * Validate theme color palette for accessibility
 */
export const validateThemePalette = (colors: Record<string, string>, isDark: boolean = false) => {
  const backgroundColor = isDark ? '#0f172a' : '#ffffff'; // slate-900 or white
  const results: Record<string, ContrastResult> = {};
  
  Object.entries(colors).forEach(([key, color]) => {
    results[key] = validateContrast(color, backgroundColor);
  });
  
  return results;
};

/**
 * Auto-detect system theme preference
 */
export const detectSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') {
    return 'light'; // Default for SSR
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Listen for system theme changes
 */
export const onSystemThemeChange = (callback: (isDark: boolean) => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.matchMedia('(prefers-contrast: high)').matches;
};