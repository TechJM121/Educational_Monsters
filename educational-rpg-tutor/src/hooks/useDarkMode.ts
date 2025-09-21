/**
 * Dark Mode Hook
 * Provides automatic theme detection, smooth transitions, and accessibility compliance
 */

import { useState, useEffect, useCallback } from 'react';
import { detectSystemTheme, onSystemThemeChange, prefersReducedMotion } from '../utils/contrastValidation';
import type { ThemeMode } from '../types/theme';

export interface DarkModeOptions {
  defaultMode?: ThemeMode;
  storageKey?: string;
  enableTransitions?: boolean;
  transitionDuration?: number;
  respectReducedMotion?: boolean;
}

export interface DarkModeState {
  mode: ThemeMode;
  isDark: boolean;
  isSystemDark: boolean;
  isTransitioning: boolean;
}

export interface DarkModeControls {
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  setLight: () => void;
  setDark: () => void;
  setAuto: () => void;
}

export type UseDarkModeReturn = [DarkModeState, DarkModeControls];

const DEFAULT_OPTIONS: Required<DarkModeOptions> = {
  defaultMode: 'auto',
  storageKey: 'theme-mode',
  enableTransitions: true,
  transitionDuration: 300,
  respectReducedMotion: true,
};

/**
 * Hook for managing dark mode with automatic detection and smooth transitions
 */
export const useDarkMode = (options: DarkModeOptions = {}): UseDarkModeReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [mode, setModeState] = useState<ThemeMode>(config.defaultMode);
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize theme from storage and system preferences
  useEffect(() => {
    const initializeTheme = () => {
      // Load saved mode from localStorage
      const savedMode = localStorage.getItem(config.storageKey) as ThemeMode;
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setModeState(savedMode);
      }

      // Detect system theme
      const systemTheme = detectSystemTheme();
      setIsSystemDark(systemTheme === 'dark');

      // Listen for system theme changes
      const cleanup = onSystemThemeChange((isDark) => {
        setIsSystemDark(isDark);
      });

      return cleanup;
    };

    const cleanup = initializeTheme();
    return cleanup;
  }, [config.storageKey]);

  // Calculate effective dark mode state
  const isDark = mode === 'dark' || (mode === 'auto' && isSystemDark);

  // Smooth transition handler
  const handleTransition = useCallback(async (newMode: ThemeMode) => {
    if (!config.enableTransitions || (config.respectReducedMotion && prefersReducedMotion())) {
      setModeState(newMode);
      localStorage.setItem(config.storageKey, newMode);
      return;
    }

    setIsTransitioning(true);

    // Add transition class to document
    document.documentElement.classList.add('theme-transitioning');

    // Apply transition styles
    const transitionStyle = document.getElementById('dark-mode-transition');
    if (!transitionStyle) {
      const style = document.createElement('style');
      style.id = 'dark-mode-transition';
      style.textContent = `
        .theme-transitioning {
          transition: background-color ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .theme-transitioning *,
        .theme-transitioning *::before,
        .theme-transitioning *::after {
          transition: 
            background-color ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
            border-color ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
            color ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
            fill ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
            stroke ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1),
            backdrop-filter ${config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Smooth glassmorphic transitions */
        .theme-transitioning [class*="backdrop-blur"],
        .theme-transitioning [class*="bg-white/"],
        .theme-transitioning [class*="bg-black/"],
        .theme-transitioning [class*="bg-slate/"] {
          transition: 
            backdrop-filter ${config.transitionDuration * 1.5}ms cubic-bezier(0.4, 0, 0.2, 1),
            background-color ${config.transitionDuration * 1.2}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Smooth gradient transitions */
        .theme-transitioning [style*="linear-gradient"],
        .theme-transitioning [class*="bg-gradient"] {
          transition: background ${config.transitionDuration * 1.5}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Update mode
    setModeState(newMode);
    localStorage.setItem(config.storageKey, newMode);

    // Dispatch custom event for theme change
    const event = new CustomEvent('themeChange', {
      detail: {
        mode: newMode,
        isDark: newMode === 'dark' || (newMode === 'auto' && isSystemDark),
        isSystemDark,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);

    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, config.transitionDuration));

    // Clean up transition classes
    document.documentElement.classList.remove('theme-transitioning');
    setIsTransitioning(false);
  }, [config, isSystemDark]);

  // Control functions
  const setMode = useCallback((newMode: ThemeMode) => {
    handleTransition(newMode);
  }, [handleTransition]);

  const toggle = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    handleTransition(newMode);
  }, [isDark, handleTransition]);

  const setLight = useCallback(() => {
    handleTransition('light');
  }, [handleTransition]);

  const setDark = useCallback(() => {
    handleTransition('dark');
  }, [handleTransition]);

  const setAuto = useCallback(() => {
    handleTransition('auto');
  }, [handleTransition]);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(isDark ? 'dark' : 'light');
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.setAttribute('data-theme-mode', mode);
    
    // Set color scheme for native form controls
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark, mode]);

  const state: DarkModeState = {
    mode,
    isDark,
    isSystemDark,
    isTransitioning,
  };

  const controls: DarkModeControls = {
    setMode,
    toggle,
    setLight,
    setDark,
    setAuto,
  };

  return [state, controls];
};

/**
 * Hook for theme-aware CSS classes
 */
export const useThemeClasses = () => {
  const [{ isDark, mode }] = useDarkMode();

  const getThemeClasses = useCallback((lightClasses: string, darkClasses: string) => {
    return isDark ? darkClasses : lightClasses;
  }, [isDark]);

  const getGlassClasses = useCallback((variant: 'light' | 'medium' | 'strong' = 'medium') => {
    const baseClasses = 'backdrop-blur-md border';
    
    if (isDark) {
      const variants = {
        light: 'bg-slate-900/10 border-slate-700/20',
        medium: 'bg-slate-900/20 border-slate-600/30',
        strong: 'bg-slate-900/30 border-slate-500/40',
      };
      return `${baseClasses} ${variants[variant]}`;
    } else {
      const variants = {
        light: 'bg-white/10 border-white/20',
        medium: 'bg-white/20 border-white/30',
        strong: 'bg-white/30 border-white/40',
      };
      return `${baseClasses} ${variants[variant]}`;
    }
  }, [isDark]);

  const getTextClasses = useCallback((variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
    if (isDark) {
      const variants = {
        primary: 'text-slate-100',
        secondary: 'text-slate-300',
        muted: 'text-slate-400',
      };
      return variants[variant];
    } else {
      const variants = {
        primary: 'text-slate-900',
        secondary: 'text-slate-700',
        muted: 'text-slate-500',
      };
      return variants[variant];
    }
  }, [isDark]);

  const getBgClasses = useCallback((variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
    if (isDark) {
      const variants = {
        primary: 'bg-slate-900',
        secondary: 'bg-slate-800',
        muted: 'bg-slate-700',
      };
      return variants[variant];
    } else {
      const variants = {
        primary: 'bg-white',
        secondary: 'bg-slate-50',
        muted: 'bg-slate-100',
      };
      return variants[variant];
    }
  }, [isDark]);

  return {
    isDark,
    mode,
    getThemeClasses,
    getGlassClasses,
    getTextClasses,
    getBgClasses,
  };
};