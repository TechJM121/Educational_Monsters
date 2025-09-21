/**
 * Motion-Safe Animation Utilities
 * Provides animation configurations that respect user motion preferences
 */

import type { MotionPreferences } from '../hooks/useReducedMotion';

export interface MotionSafeConfig {
  duration: number;
  easing: string;
  scale?: number;
  opacity?: number;
  x?: number;
  y?: number;
  rotate?: number;
}

export interface AlternativeIndicator {
  type: 'color' | 'border' | 'shadow' | 'size' | 'opacity';
  intensity: 'subtle' | 'medium' | 'strong';
  duration: number;
}

// Predefined motion-safe animation presets
export const motionSafePresets = {
  // Micro-interactions
  buttonHover: {
    default: {
      scale: 1.05,
      duration: 0.2,
      easing: 'easeOut'
    },
    reduced: {
      scale: 1.02,
      duration: 0.1,
      easing: 'easeOut'
    },
    alternative: {
      type: 'color' as const,
      intensity: 'medium' as const,
      duration: 0.15
    }
  },

  // Focus states
  focusRing: {
    default: {
      scale: 1.02,
      duration: 0.15,
      easing: 'easeOut'
    },
    reduced: {
      scale: 1,
      duration: 0.1,
      easing: 'easeOut'
    },
    alternative: {
      type: 'border' as const,
      intensity: 'strong' as const,
      duration: 0.1
    }
  },

  // Page transitions
  pageTransition: {
    default: {
      x: 20,
      opacity: 0,
      duration: 0.4,
      easing: 'easeInOut'
    },
    reduced: {
      x: 5,
      opacity: 0.5,
      duration: 0.2,
      easing: 'easeOut'
    },
    alternative: {
      type: 'opacity' as const,
      intensity: 'subtle' as const,
      duration: 0.15
    }
  },

  // Loading states
  loadingPulse: {
    default: {
      scale: 1.1,
      opacity: 0.7,
      duration: 1.2,
      easing: 'easeInOut'
    },
    reduced: {
      scale: 1,
      opacity: 0.8,
      duration: 0.8,
      easing: 'easeOut'
    },
    alternative: {
      type: 'opacity' as const,
      intensity: 'medium' as const,
      duration: 0.6
    }
  },

  // Celebration animations
  celebration: {
    default: {
      scale: 1.2,
      rotate: 5,
      duration: 0.6,
      easing: 'easeOut'
    },
    reduced: {
      scale: 1.05,
      rotate: 0,
      duration: 0.3,
      easing: 'easeOut'
    },
    alternative: {
      type: 'color' as const,
      intensity: 'strong' as const,
      duration: 0.4
    }
  }
};

// Create motion-safe animation configuration
export const createMotionSafeAnimation = (
  presetName: keyof typeof motionSafePresets,
  preferences: MotionPreferences,
  customConfig?: Partial<MotionSafeConfig>
): MotionSafeConfig => {
  const preset = motionSafePresets[presetName];
  
  if (preferences.prefersReducedMotion || preferences.animationIntensity < 0.3) {
    return {
      ...preset.reduced,
      duration: preset.reduced.duration * preferences.animationDuration,
      scale: preset.reduced.scale ? 1 + (preset.reduced.scale - 1) * preferences.animationIntensity : undefined,
      x: preset.reduced.x ? preset.reduced.x * preferences.animationIntensity : undefined,
      y: preset.reduced.y ? preset.reduced.y * preferences.animationIntensity : undefined,
      rotate: preset.reduced.rotate ? preset.reduced.rotate * preferences.animationIntensity : undefined,
      ...customConfig
    };
  }

  return {
    ...preset.default,
    duration: preset.default.duration * preferences.animationDuration,
    scale: preset.default.scale ? 1 + (preset.default.scale - 1) * preferences.animationIntensity : undefined,
    x: preset.default.x ? preset.default.x * preferences.animationIntensity : undefined,
    y: preset.default.y ? preset.default.y * preferences.animationIntensity : undefined,
    rotate: preset.default.rotate ? preset.default.rotate * preferences.animationIntensity : undefined,
    ...customConfig
  };
};

// Generate alternative visual indicators for reduced motion
export const getAlternativeIndicator = (
  presetName: keyof typeof motionSafePresets,
  preferences: MotionPreferences
): AlternativeIndicator | null => {
  if (!preferences.prefersReducedMotion && preferences.animationIntensity > 0.3) {
    return null;
  }

  const preset = motionSafePresets[presetName];
  return preset.alternative;
};

// CSS class generators for alternative indicators
export const generateAlternativeCSS = (indicator: AlternativeIndicator): string => {
  const baseClasses = `transition-all duration-${Math.round(indicator.duration * 1000)}`;
  
  switch (indicator.type) {
    case 'color':
      return `${baseClasses} ${
        indicator.intensity === 'subtle' ? 'hover:bg-blue-50' :
        indicator.intensity === 'medium' ? 'hover:bg-blue-100' :
        'hover:bg-blue-200'
      }`;
    
    case 'border':
      return `${baseClasses} ${
        indicator.intensity === 'subtle' ? 'hover:border-blue-300' :
        indicator.intensity === 'medium' ? 'hover:border-blue-500' :
        'hover:border-blue-700'
      }`;
    
    case 'shadow':
      return `${baseClasses} ${
        indicator.intensity === 'subtle' ? 'hover:shadow-sm' :
        indicator.intensity === 'medium' ? 'hover:shadow-md' :
        'hover:shadow-lg'
      }`;
    
    case 'size':
      return `${baseClasses} ${
        indicator.intensity === 'subtle' ? 'hover:scale-101' :
        indicator.intensity === 'medium' ? 'hover:scale-102' :
        'hover:scale-105'
      }`;
    
    case 'opacity':
      return `${baseClasses} ${
        indicator.intensity === 'subtle' ? 'hover:opacity-90' :
        indicator.intensity === 'medium' ? 'hover:opacity-80' :
        'hover:opacity-70'
      }`;
    
    default:
      return baseClasses;
  }
};

// Framer Motion variants that respect motion preferences
export const createMotionVariants = (preferences: MotionPreferences) => ({
  // Button interactions
  button: {
    rest: { scale: 1 },
    hover: createMotionSafeAnimation('buttonHover', preferences),
    tap: { 
      scale: preferences.prefersReducedMotion ? 0.99 : 0.95,
      transition: { duration: 0.1 }
    }
  },

  // Focus states
  focusable: {
    blur: { scale: 1 },
    focus: createMotionSafeAnimation('focusRing', preferences)
  },

  // Page transitions
  page: {
    initial: {
      opacity: preferences.prefersReducedMotion ? 0.8 : 0,
      x: preferences.prefersReducedMotion ? 0 : 20
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3 * preferences.animationDuration,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: preferences.prefersReducedMotion ? 0.8 : 0,
      x: preferences.prefersReducedMotion ? 0 : -20,
      transition: {
        duration: 0.2 * preferences.animationDuration,
        ease: 'easeIn'
      }
    }
  },

  // Loading states
  loading: {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: preferences.prefersReducedMotion ? [1, 1, 1] : [1, 1.05, 1],
      transition: {
        duration: 1.5 * preferences.animationDuration,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },

  // Celebration
  celebrate: {
    animate: {
      scale: preferences.prefersReducedMotion ? [1, 1.02, 1] : [1, 1.2, 1],
      rotate: preferences.prefersReducedMotion ? [0, 0, 0] : [0, 5, -5, 0],
      transition: {
        duration: 0.6 * preferences.animationDuration,
        ease: 'easeOut'
      }
    }
  }
});

// Utility to check if animation should be disabled
export const shouldDisableAnimation = (
  animationType: 'micro' | 'transition' | 'particle' | 'celebration',
  preferences: MotionPreferences
): boolean => {
  switch (animationType) {
    case 'micro':
      return !preferences.enableMicroAnimations;
    case 'transition':
      return !preferences.enableTransitions;
    case 'particle':
      return !preferences.enableParticles;
    case 'celebration':
      return preferences.prefersReducedMotion && preferences.animationIntensity < 0.2;
    default:
      return false;
  }
};