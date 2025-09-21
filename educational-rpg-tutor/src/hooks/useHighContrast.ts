/**
 * useHighContrast Hook
 * Manages high contrast mode for improved accessibility
 */

import { useState, useEffect, useCallback } from 'react';

export interface HighContrastTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
  };
}

export interface HighContrastState {
  isHighContrastMode: boolean;
  currentTheme: HighContrastTheme;
  systemPreference: boolean;
  userOverride: boolean | null;
}

const STORAGE_KEY = 'high-contrast-preferences';

// High contrast theme definitions
const highContrastThemes: Record<string, HighContrastTheme> = {
  blackOnWhite: {
    id: 'blackOnWhite',
    name: 'Black on White',
    colors: {
      background: '#ffffff',
      surface: '#ffffff',
      primary: '#000000',
      secondary: '#333333',
      text: '#000000',
      textSecondary: '#333333',
      border: '#000000',
      focus: '#0066cc',
      error: '#cc0000',
      success: '#006600',
      warning: '#cc6600',
      info: '#0066cc',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.8)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.8)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.8)',
    },
  },
  whiteOnBlack: {
    id: 'whiteOnBlack',
    name: 'White on Black',
    colors: {
      background: '#000000',
      surface: '#000000',
      primary: '#ffffff',
      secondary: '#cccccc',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#ffffff',
      focus: '#66ccff',
      error: '#ff6666',
      success: '#66ff66',
      warning: '#ffcc66',
      info: '#66ccff',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(255, 255, 255, 0.8)',
      md: '0 4px 6px -1px rgba(255, 255, 255, 0.8)',
      lg: '0 10px 15px -3px rgba(255, 255, 255, 0.8)',
    },
  },
  yellowOnBlack: {
    id: 'yellowOnBlack',
    name: 'Yellow on Black',
    colors: {
      background: '#000000',
      surface: '#000000',
      primary: '#ffff00',
      secondary: '#cccc00',
      text: '#ffff00',
      textSecondary: '#cccc00',
      border: '#ffff00',
      focus: '#00ffff',
      error: '#ff0000',
      success: '#00ff00',
      warning: '#ff8800',
      info: '#00ffff',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(255, 255, 0, 0.8)',
      md: '0 4px 6px -1px rgba(255, 255, 0, 0.8)',
      lg: '0 10px 15px -3px rgba(255, 255, 0, 0.8)',
    },
  },
};

const defaultTheme = highContrastThemes.blackOnWhite;

export const useHighContrast = () => {
  const [state, setState] = useState<HighContrastState>(() => {
    // Check system preference
    const systemPreference = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Load user preferences
    let userOverride: boolean | null = null;
    let savedThemeId = 'blackOnWhite';
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        userOverride = parsed.userOverride;
        savedThemeId = parsed.themeId || 'blackOnWhite';
      }
    } catch (error) {
      console.warn('Failed to load high contrast preferences:', error);
    }

    const isHighContrastMode = userOverride !== null ? userOverride : systemPreference;
    const currentTheme = highContrastThemes[savedThemeId] || defaultTheme;

    return {
      isHighContrastMode,
      currentTheme,
      systemPreference,
      userOverride,
    };
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setState(prev => ({
        ...prev,
        systemPreference: e.matches,
        // Only update mode if user hasn't overridden
        isHighContrastMode: prev.userOverride !== null ? prev.isHighContrastMode : e.matches,
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      const preferences = {
        userOverride: state.userOverride,
        themeId: state.currentTheme.id,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save high contrast preferences:', error);
    }
  }, [state.userOverride, state.currentTheme.id]);

  // Apply CSS custom properties
  useEffect(() => {
    if (state.isHighContrastMode) {
      const root = document.documentElement;
      const theme = state.currentTheme;
      
      // Apply color variables
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--hc-${key}`, value);
      });
      
      // Apply shadow variables
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--hc-shadow-${key}`, value);
      });
      
      // Add high contrast class
      root.classList.add('high-contrast-mode');
      root.setAttribute('data-high-contrast-theme', theme.id);
    } else {
      // Remove high contrast variables and class
      const root = document.documentElement;
      root.classList.remove('high-contrast-mode');
      root.removeAttribute('data-high-contrast-theme');
      
      // Remove CSS variables
      const computedStyle = getComputedStyle(root);
      Array.from(computedStyle).forEach(property => {
        if (property.startsWith('--hc-')) {
          root.style.removeProperty(property);
        }
      });
    }
  }, [state.isHighContrastMode, state.currentTheme]);

  // Control functions
  const toggleHighContrast = useCallback(() => {
    setState(prev => ({
      ...prev,
      isHighContrastMode: !prev.isHighContrastMode,
      userOverride: !prev.isHighContrastMode,
    }));
  }, []);

  const setHighContrastMode = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isHighContrastMode: enabled,
      userOverride: enabled,
    }));
  }, []);

  const setTheme = useCallback((themeId: string) => {
    const theme = highContrastThemes[themeId];
    if (theme) {
      setState(prev => ({
        ...prev,
        currentTheme: theme,
      }));
    }
  }, []);

  const resetToSystemPreference = useCallback(() => {
    setState(prev => ({
      ...prev,
      isHighContrastMode: prev.systemPreference,
      userOverride: null,
    }));
  }, []);

  return {
    state,
    isHighContrastMode: state.isHighContrastMode,
    currentTheme: state.currentTheme,
    availableThemes: Object.values(highContrastThemes),
    systemPreference: state.systemPreference,
    userOverride: state.userOverride,
    toggleHighContrast,
    setHighContrastMode,
    setTheme,
    resetToSystemPreference,
  };
};

// Utility function to get high contrast safe colors
export const getHighContrastColor = (
  colorType: keyof HighContrastTheme['colors'],
  fallback: string,
  isHighContrast: boolean,
  theme: HighContrastTheme
): string => {
  return isHighContrast ? theme.colors[colorType] : fallback;
};

// Utility function to validate contrast ratios
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// Utility function to check if colors meet WCAG contrast requirements
export const meetsContrastRequirement = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
};

// CSS class generator for high contrast mode
export const getHighContrastClasses = (
  isHighContrast: boolean,
  baseClasses: string,
  highContrastClasses: string
): string => {
  return isHighContrast ? `${baseClasses} ${highContrastClasses}` : baseClasses;
};