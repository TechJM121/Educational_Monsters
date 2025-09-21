/**
 * Modern Design System - Main Export
 * Central export point for all design system components, utilities, and types
 */

// Type exports
export type * from '../types/animation';
export type * from '../types/theme';

// Context exports
export { AnimationProvider, useAnimation, usePerformanceAwareAnimation, useDeviceAdaptation } from '../contexts/AnimationContext';
export { ThemeProvider, useTheme, useThemeStyles } from '../contexts/ThemeContext';

// Utility exports
export { PerformanceMonitor, DeviceCapabilityDetector, animationUtils, memoryUtils } from '../utils/performance';
export { AdvancedDeviceDetector, deviceUtils } from '../utils/deviceCapability';

// Re-export commonly used libraries for convenience
export { motion, AnimatePresence } from 'framer-motion';
export { useSpring, animated, config } from '@react-spring/web';

/**
 * Design System Configuration
 * Central configuration object for the modern design system
 */
export const designSystemConfig = {
  version: '1.0.0',
  name: 'Modern RPG UI',
  description: 'A modern, glassmorphic design system for educational RPG applications',
  
  // Default animation settings
  animations: {
    defaultDuration: 300,
    defaultEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    reducedMotionDuration: 150,
  },
  
  // Performance thresholds
  performance: {
    targetFPS: 60,
    throttleThreshold: 45,
    memoryThreshold: 100, // MB
  },
  
  // Device capability thresholds
  deviceTiers: {
    high: { minScore: 12, maxParticles: 150 },
    medium: { minScore: 7, maxParticles: 75 },
    low: { minScore: 0, maxParticles: 25 },
  },
  
  // Accessibility settings
  accessibility: {
    respectReducedMotion: true,
    minContrastRatio: 4.5,
    focusRingWidth: '2px',
  },
} as const;

/**
 * Utility function to initialize the design system
 * Should be called once at the app root level
 */
export const initializeDesignSystem = async () => {
  // Import here to avoid circular dependencies
  const { PerformanceMonitor } = await import('../utils/performance');
  const { AdvancedDeviceDetector } = await import('../utils/deviceCapability');
  
  // Start performance monitoring
  const performanceMonitor = PerformanceMonitor.getInstance();
  performanceMonitor.startMonitoring();
  
  // Detect device capabilities
  const deviceDetector = AdvancedDeviceDetector.getInstance();
  const deviceInfo = await deviceDetector.detectDevice();
  
  console.log('🎨 Modern Design System initialized', {
    version: designSystemConfig.version,
    deviceCapability: deviceInfo.capability,
    reducedMotion: typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  });
  
  return {
    deviceInfo,
    performanceMonitor,
    deviceDetector,
  };
};

/**
 * Common animation presets for consistent usage across components
 */
export const animationPresets = {
  // Micro-interactions
  buttonHover: {
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  buttonPress: {
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeOut' },
  },
  
  // Card animations
  cardHover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  cardPress: {
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeOut' },
  },
  
  // Modal animations
  modalEnter: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  modalExit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
  
  // Page transitions
  pageEnter: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  
  pageExit: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
  
  // Loading animations
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  
  shimmer: {
    x: ['-100%', '100%'],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
  
  // Celebration animations
  bounce: {
    y: [0, -20, 0],
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  
  confetti: {
    rotate: [0, 360],
    scale: [1, 1.2, 0.8, 1],
    transition: { duration: 1, ease: 'easeOut' },
  },
} as const;

/**
 * Common glass morphism styles
 */
export const glassStyles = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
} as const;