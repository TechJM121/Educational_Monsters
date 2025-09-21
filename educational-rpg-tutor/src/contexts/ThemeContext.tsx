/**
 * Modern Theme Context Provider
 * Manages glassmorphic themes, customization, and theme persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  ModernTheme, 
  ThemeMode, 
  ThemeCustomization, 
  ThemeContext as ThemeContextType 
} from '../types/theme';

// Default modern theme
const defaultTheme: ModernTheme = {
  id: 'default-modern',
  name: 'Modern RPG',
  mode: 'light',
  colors: {
    primary: {
      50: '#fef7ee',
      100: '#fdedd3',
      200: '#fbd7a5',
      300: '#f8bb6d',
      400: '#f59532',
      500: '#f2750a',
      600: '#e35d05',
      700: '#bc4508',
      800: '#95370e',
      900: '#792f0f',
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      highlight: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(31, 38, 135, 0.37)',
    },
    gradient: {
      cosmic: { start: '#667eea', end: '#764ba2' },
      sunset: { start: '#f093fb', end: '#f5576c' },
      ocean: { start: '#4facfe', end: '#00f2fe' },
      forest: { start: '#43e97b', end: '#38f9d7' },
    },
  },
  effects: {
    blur: {
      backdrop: 'md',
      content: 'sm',
      overlay: 'lg',
    },
    shadows: {
      glass: 'md',
      depth: 'lg',
      glow: 'md',
    },
    gradients: {
      cosmic: { start: '#667eea', end: '#764ba2' },
      sunset: { start: '#f093fb', end: '#f5576c' },
      ocean: { start: '#4facfe', end: '#00f2fe' },
      forest: { start: '#43e97b', end: '#38f9d7' },
    },
  },
  typography: {
    scale: {
      xs: { fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', lineHeight: '1.4' },
      sm: { fontSize: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', lineHeight: '1.5' },
      base: { fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', lineHeight: '1.6' },
      lg: { fontSize: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', lineHeight: '1.5' },
      xl: { fontSize: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', lineHeight: '1.4' },
      '2xl': { fontSize: 'clamp(1.5rem, 1.3rem + 1vw, 2rem)', lineHeight: '1.3' },
      '3xl': { fontSize: 'clamp(2rem, 1.7rem + 1.5vw, 3rem)', lineHeight: '1.2' },
    },
    families: {
      rpg: ['Cinzel', 'serif'],
      fantasy: ['MedievalSharp', 'cursive'],
      modern: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'system-ui', 'sans-serif'],
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  animations: {
    micro: { duration: 200, easing: 'ease-out', enabled: true },
    hover: { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', enabled: true },
    focus: { duration: 150, easing: 'ease-out', enabled: true },
    celebration: { duration: 1000, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', enabled: true },
    transition: { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', enabled: true },
    loading: { duration: 1500, easing: 'ease-in-out', repeat: -1, enabled: true },
  },
};

// Dark theme variant
const darkTheme: ModernTheme = {
  ...defaultTheme,
  id: 'dark-modern',
  name: 'Dark Modern RPG',
  mode: 'dark',
  colors: {
    ...defaultTheme.colors,
    glass: {
      background: 'rgba(0, 0, 0, 0.2)',
      border: 'rgba(255, 255, 255, 0.1)',
      highlight: 'rgba(255, 255, 255, 0.15)',
      shadow: 'rgba(0, 0, 0, 0.5)',
    },
  },
};

// Theme storage key
const THEME_STORAGE_KEY = 'modern-ui-theme';
const CUSTOMIZATION_STORAGE_KEY = 'modern-ui-customization';

// Create context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Provider component
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ModernTheme>(defaultTheme);
  const [mode, setThemeMode] = useState<ThemeMode>('auto');
  const [customization, setCustomization] = useState<ThemeCustomization>({});

  // Initialize theme from storage and system preferences
  useEffect(() => {
    const initializeTheme = () => {
      // Load saved theme mode
      const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setThemeMode(savedMode);
      }

      // Load customization
      const savedCustomization = localStorage.getItem(CUSTOMIZATION_STORAGE_KEY);
      if (savedCustomization) {
        try {
          const parsed = JSON.parse(savedCustomization);
          setCustomization(parsed);
        } catch (error) {
          console.warn('Failed to parse saved theme customization:', error);
        }
      }

      // Apply system theme if auto mode
      const applySystemTheme = () => {
        const effectiveMode = savedMode === 'auto' || !savedMode 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : savedMode;
        
        setCurrentTheme(effectiveMode === 'dark' ? darkTheme : defaultTheme);
      };

      applySystemTheme();

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        if (savedMode === 'auto' || !savedMode) {
          applySystemTheme();
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };

    const cleanup = initializeTheme();
    return cleanup;
  }, []);

  // Apply theme mode changes
  useEffect(() => {
    const effectiveMode = mode === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    
    setCurrentTheme(effectiveMode === 'dark' ? darkTheme : defaultTheme);
  }, [mode]);

  // Apply customizations to theme
  useEffect(() => {
    if (Object.keys(customization).length === 0) return;

    const customizedTheme = { ...currentTheme };

    // Apply color customizations
    if (customization.primaryColor) {
      // This would need a color palette generator in a real implementation
      // For now, we'll just update the main color
      customizedTheme.colors.primary[500] = customization.primaryColor;
    }

    if (customization.secondaryColor) {
      customizedTheme.colors.secondary[500] = customization.secondaryColor;
    }

    if (customization.accentColor) {
      customizedTheme.colors.accent[500] = customization.accentColor;
    }

    // Apply effect customizations
    if (customization.blurIntensity) {
      customizedTheme.effects.blur.backdrop = customization.blurIntensity;
    }

    if (customization.shadowIntensity) {
      customizedTheme.effects.shadows.glass = customization.shadowIntensity;
    }

    if (customization.glowIntensity) {
      customizedTheme.effects.shadows.glow = customization.glowIntensity;
    }

    // Apply gradient customizations
    if (customization.gradientPreset && customizedTheme.effects.gradients[customization.gradientPreset]) {
      const selectedGradient = customizedTheme.effects.gradients[customization.gradientPreset];
      if (selectedGradient) {
        // Set as primary gradient or handle as needed
        customizedTheme.colors.gradient.custom = selectedGradient;
      }
    }

    if (customization.customGradient) {
      customizedTheme.effects.gradients.custom = customization.customGradient;
    }

    setCurrentTheme(customizedTheme);
  }, [customization, mode]);

  // Context methods
  const setTheme = useCallback((theme: ModernTheme) => {
    setCurrentTheme(theme);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setThemeMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  }, []);

  const updateCustomization = useCallback((newCustomization: Partial<ThemeCustomization>) => {
    const updated = { ...customization, ...newCustomization };
    setCustomization(updated);
    localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(updated));
  }, [customization]);

  const resetToDefault = useCallback(() => {
    setCustomization({});
    localStorage.removeItem(CUSTOMIZATION_STORAGE_KEY);
    setCurrentTheme(mode === 'dark' ? darkTheme : defaultTheme);
  }, [mode]);

  const exportTheme = useCallback((): string => {
    const exportData = {
      theme: currentTheme,
      mode,
      customization,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  }, [currentTheme, mode, customization]);

  const importTheme = useCallback((themeData: string): boolean => {
    try {
      const parsed = JSON.parse(themeData);
      
      if (parsed.theme && parsed.mode !== undefined) {
        setCurrentTheme(parsed.theme);
        setThemeMode(parsed.mode);
        
        if (parsed.customization) {
          setCustomization(parsed.customization);
          localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(parsed.customization));
        }
        
        localStorage.setItem(THEME_STORAGE_KEY, parsed.mode);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }, []);

  // Apply CSS custom properties for theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(currentTheme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    Object.entries(currentTheme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    Object.entries(currentTheme.colors.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value);
    });
    
    Object.entries(currentTheme.colors.glass).forEach(([key, value]) => {
      root.style.setProperty(`--glass-${key}`, value);
    });

    // Apply gradient variables
    Object.entries(currentTheme.colors.gradient).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}-start`, value.start);
      root.style.setProperty(`--gradient-${key}-end`, value.end);
    });

    // Apply spacing variables
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius variables
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
  }, [currentTheme]);

  const contextValue: ThemeContextType = {
    currentTheme,
    mode,
    customization,
    setTheme,
    setMode,
    updateCustomization,
    resetToDefault,
    exportTheme,
    importTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for theme-aware styling
export const useThemeStyles = () => {
  const { currentTheme, mode } = useTheme();

  const getGlassStyles = useCallback((variant: 'light' | 'medium' | 'strong' = 'medium') => {
    const opacity = variant === 'light' ? 0.05 : variant === 'medium' ? 0.1 : 0.15;
    const borderOpacity = variant === 'light' ? 0.1 : variant === 'medium' ? 0.2 : 0.3;
    
    return {
      backgroundColor: mode === 'dark' 
        ? `rgba(0, 0, 0, ${opacity})` 
        : `rgba(255, 255, 255, ${opacity})`,
      borderColor: mode === 'dark'
        ? `rgba(255, 255, 255, ${borderOpacity})`
        : `rgba(255, 255, 255, ${borderOpacity})`,
      backdropFilter: `blur(${currentTheme.effects.blur.backdrop === 'sm' ? '4px' : '8px'})`,
    };
  }, [currentTheme, mode]);

  const getGradientStyles = useCallback((preset: keyof typeof currentTheme.colors.gradient) => {
    const gradient = currentTheme.colors.gradient[preset];
    if (!gradient) {
      return { background: 'transparent' };
    }
    return {
      background: `linear-gradient(135deg, ${gradient.start}, ${gradient.end})`,
    };
  }, [currentTheme]);

  return {
    theme: currentTheme,
    mode,
    getGlassStyles,
    getGradientStyles,
  };
};