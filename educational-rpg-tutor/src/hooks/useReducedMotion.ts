/**
 * useReducedMotion Hook
 * Detects and responds to user's motion preferences for accessibility
 */

import { useState, useEffect, useCallback } from 'react';

export interface MotionPreferences {
  prefersReducedMotion: boolean;
  animationDuration: number;
  animationIntensity: number;
  enableMicroAnimations: boolean;
  enableTransitions: boolean;
  enableParticles: boolean;
}

export interface MotionControls {
  setAnimationDuration: (duration: number) => void;
  setAnimationIntensity: (intensity: number) => void;
  toggleMicroAnimations: () => void;
  toggleTransitions: () => void;
  toggleParticles: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'motion-preferences';

const defaultPreferences: MotionPreferences = {
  prefersReducedMotion: false,
  animationDuration: 1,
  animationIntensity: 1,
  enableMicroAnimations: true,
  enableTransitions: true,
  enableParticles: true,
};

const reducedMotionPreferences: MotionPreferences = {
  prefersReducedMotion: true,
  animationDuration: 0.3,
  animationIntensity: 0.2,
  enableMicroAnimations: false,
  enableTransitions: true,
  enableParticles: false,
};

export const useReducedMotion = () => {
  const [preferences, setPreferences] = useState<MotionPreferences>(() => {
    // Check system preference first
    const systemPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Try to load saved preferences
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load motion preferences:', error);
    }
    
    // Use system preference as fallback
    return systemPrefersReduced ? reducedMotionPreferences : defaultPreferences;
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({
        ...prev,
        prefersReducedMotion: e.matches,
        // Auto-adjust other settings based on system preference
        ...(e.matches ? {
          animationDuration: Math.min(prev.animationDuration, 0.5),
          animationIntensity: Math.min(prev.animationIntensity, 0.3),
          enableMicroAnimations: false,
          enableParticles: false,
        } : {})
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save motion preferences:', error);
    }
  }, [preferences]);

  // Control functions
  const controls: MotionControls = {
    setAnimationDuration: useCallback((duration: number) => {
      setPreferences(prev => ({
        ...prev,
        animationDuration: Math.max(0.1, Math.min(2, duration))
      }));
    }, []),

    setAnimationIntensity: useCallback((intensity: number) => {
      setPreferences(prev => ({
        ...prev,
        animationIntensity: Math.max(0, Math.min(1, intensity))
      }));
    }, []),

    toggleMicroAnimations: useCallback(() => {
      setPreferences(prev => ({
        ...prev,
        enableMicroAnimations: !prev.enableMicroAnimations
      }));
    }, []),

    toggleTransitions: useCallback(() => {
      setPreferences(prev => ({
        ...prev,
        enableTransitions: !prev.enableTransitions
      }));
    }, []),

    toggleParticles: useCallback(() => {
      setPreferences(prev => ({
        ...prev,
        enableParticles: !prev.enableParticles
      }));
    }, []),

    resetToDefaults: useCallback(() => {
      const systemPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setPreferences(systemPrefersReduced ? reducedMotionPreferences : defaultPreferences);
    }, []),
  };

  return {
    preferences,
    controls,
    // Convenience getters
    shouldReduceMotion: preferences.prefersReducedMotion,
    animationDuration: preferences.animationDuration,
    animationIntensity: preferences.animationIntensity,
    enableMicroAnimations: preferences.enableMicroAnimations,
    enableTransitions: preferences.enableTransitions,
    enableParticles: preferences.enableParticles,
  };
};

// Utility function to get motion-safe animation props
export const getMotionSafeProps = (
  baseProps: any,
  preferences: MotionPreferences
) => {
  if (preferences.prefersReducedMotion) {
    return {
      ...baseProps,
      transition: {
        ...baseProps.transition,
        duration: (baseProps.transition?.duration || 0.3) * preferences.animationDuration,
        type: 'tween',
        ease: 'easeOut',
      },
      // Reduce or eliminate transforms that might cause motion sickness
      animate: {
        ...baseProps.animate,
        scale: baseProps.animate?.scale ? 1 + (baseProps.animate.scale - 1) * preferences.animationIntensity : undefined,
        rotate: baseProps.animate?.rotate ? baseProps.animate.rotate * preferences.animationIntensity : undefined,
        x: baseProps.animate?.x ? baseProps.animate.x * preferences.animationIntensity : undefined,
        y: baseProps.animate?.y ? baseProps.animate.y * preferences.animationIntensity : undefined,
      },
    };
  }
  
  return baseProps;
};

// CSS custom properties for motion preferences
export const getMotionCSSVars = (preferences: MotionPreferences) => ({
  '--animation-duration-multiplier': preferences.animationDuration.toString(),
  '--animation-intensity-multiplier': preferences.animationIntensity.toString(),
  '--enable-micro-animations': preferences.enableMicroAnimations ? '1' : '0',
  '--enable-transitions': preferences.enableTransitions ? '1' : '0',
  '--enable-particles': preferences.enableParticles ? '1' : '0',
});