import type { ParticleConfig, DeviceCapability } from '../../types/animation';

export const createParticleConfig = (
  theme: 'magical' | 'tech' | 'nature' | 'cosmic' = 'magical',
  deviceCapability: DeviceCapability = 'medium'
): ParticleConfig => {
  const baseConfigs: Record<typeof theme, Omit<ParticleConfig, 'count'>> = {
    magical: {
      size: { min: 2, max: 8 },
      speed: { min: 0.2, max: 1.5 },
      color: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#F3E8FF', '#E879F9'],
      opacity: { min: 0.3, max: 0.8 },
      interactionRadius: 80,
      magneticForce: 0.02,
      friction: 0.98
    },
    tech: {
      size: { min: 1, max: 6 },
      speed: { min: 0.5, max: 2.0 },
      color: ['#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63', '#22D3EE'],
      opacity: { min: 0.4, max: 0.9 },
      interactionRadius: 100,
      magneticForce: 0.03,
      friction: 0.95
    },
    nature: {
      size: { min: 3, max: 10 },
      speed: { min: 0.1, max: 1.0 },
      color: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#34D399'],
      opacity: { min: 0.2, max: 0.7 },
      interactionRadius: 60,
      magneticForce: 0.015,
      friction: 0.99
    },
    cosmic: {
      size: { min: 1, max: 12 },
      speed: { min: 0.3, max: 1.8 },
      color: ['#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3', '#A78BFA'],
      opacity: { min: 0.3, max: 0.9 },
      interactionRadius: 120,
      magneticForce: 0.025,
      friction: 0.97
    }
  };

  const deviceMultipliers: Record<DeviceCapability, number> = {
    high: 1.0,
    medium: 0.6,
    low: 0.3
  };

  const baseConfig = baseConfigs[theme];
  const multiplier = deviceMultipliers[deviceCapability];

  return {
    ...baseConfig,
    count: Math.floor(100 * multiplier), // Base count of 100 particles
    interactionRadius: baseConfig.interactionRadius * Math.max(multiplier, 0.5),
    magneticForce: baseConfig.magneticForce * multiplier
  };
};

export const getThemeColors = (theme: 'magical' | 'tech' | 'nature' | 'cosmic') => {
  const themeColors = {
    magical: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: 'rgba(139, 92, 246, 0.1)'
    },
    tech: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      accent: '#0E7490',
      background: 'rgba(6, 182, 212, 0.1)'
    },
    nature: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#047857',
      background: 'rgba(16, 185, 129, 0.1)'
    },
    cosmic: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#5B21B6',
      background: 'rgba(124, 58, 237, 0.1)'
    }
  };

  return themeColors[theme];
};

export const getThemeBehaviors = (theme: 'magical' | 'tech' | 'nature' | 'cosmic') => {
  const behaviors = {
    magical: {
      spawnAnimation: 'spiral' as const,
      despawnAnimation: 'fade' as const,
      movementPattern: 'floating',
      interactionType: 'gentle',
      transitionDuration: 800
    },
    tech: {
      spawnAnimation: 'burst' as const,
      despawnAnimation: 'implode' as const,
      movementPattern: 'linear',
      interactionType: 'magnetic',
      transitionDuration: 400
    },
    nature: {
      spawnAnimation: 'scale' as const,
      despawnAnimation: 'scatter' as const,
      movementPattern: 'organic',
      interactionType: 'soft',
      transitionDuration: 1000
    },
    cosmic: {
      spawnAnimation: 'burst' as const,
      despawnAnimation: 'implode' as const,
      movementPattern: 'orbital',
      interactionType: 'strong',
      transitionDuration: 600
    }
  };

  return behaviors[theme];
};