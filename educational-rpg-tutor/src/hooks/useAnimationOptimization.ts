import { useState, useEffect, useCallback } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { 
  PerformanceOptimizer, 
  AnimationComplexitySettings,
  performanceOptimizer 
} from '../utils/performanceOptimizer';

export interface AnimationOptimizationConfig {
  enableAutoOptimization: boolean;
  optimizationInterval: number;
  userPreferences?: Partial<AnimationComplexitySettings>;
}

const DEFAULT_CONFIG: AnimationOptimizationConfig = {
  enableAutoOptimization: true,
  optimizationInterval: 3000, // Check every 3 seconds
};

export const useAnimationOptimization = (
  config: Partial<AnimationOptimizationConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { metrics } = usePerformanceMonitor();
  
  const [settings, setSettings] = useState<AnimationComplexitySettings>(() =>
    performanceOptimizer.getSettingsForDevice(metrics.deviceCapability)
  );
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationLog, setOptimizationLog] = useState<string[]>([]);

  const logOptimization = useCallback((message: string) => {
    setOptimizationLog(prev => {
      const newLog = [...prev, `${new Date().toLocaleTimeString()}: ${message}`];
      return newLog.slice(-10); // Keep only last 10 entries
    });
  }, []);

  const applyOptimizations = useCallback(async () => {
    if (!finalConfig.enableAutoOptimization) return;

    setIsOptimizing(true);
    
    try {
      // Apply user preferences first
      if (finalConfig.userPreferences) {
        const userSettings = {
          ...performanceOptimizer.getCurrentSettings(),
          ...finalConfig.userPreferences
        };
        performanceOptimizer['currentSettings'] = userSettings;
      }

      const newSettings = performanceOptimizer.optimizeBasedOnMetrics(metrics);
      
      if (JSON.stringify(newSettings) !== JSON.stringify(settings)) {
        setSettings(newSettings);
        
        const appliedOptimizations = performanceOptimizer.getAppliedOptimizations();
        if (appliedOptimizations.length > 0) {
          logOptimization(`Applied optimizations: ${appliedOptimizations.join(', ')}`);
        } else {
          logOptimization('Performance restored - optimizations reset');
        }
      }
    } catch (error) {
      console.error('Animation optimization error:', error);
      logOptimization(`Optimization error: ${error}`);
    } finally {
      setIsOptimizing(false);
    }
  }, [finalConfig, metrics, settings, logOptimization]);

  const manualOptimize = useCallback(() => {
    applyOptimizations();
  }, [applyOptimizations]);

  const resetOptimizations = useCallback(() => {
    performanceOptimizer.resetOptimizations();
    const baseSettings = performanceOptimizer.getSettingsForDevice(metrics.deviceCapability);
    setSettings(baseSettings);
    logOptimization('Optimizations manually reset');
  }, [metrics.deviceCapability, logOptimization]);

  const updateUserPreferences = useCallback((preferences: Partial<AnimationComplexitySettings>) => {
    const newSettings = {
      ...settings,
      ...preferences
    };
    setSettings(newSettings);
    logOptimization('User preferences updated');
  }, [settings, logOptimization]);

  // Auto-optimization effect
  useEffect(() => {
    if (!finalConfig.enableAutoOptimization) return;

    const interval = setInterval(applyOptimizations, finalConfig.optimizationInterval);
    
    return () => clearInterval(interval);
  }, [applyOptimizations, finalConfig.enableAutoOptimization, finalConfig.optimizationInterval]);

  // Initial device-based optimization
  useEffect(() => {
    const deviceSettings = performanceOptimizer.getSettingsForDevice(metrics.deviceCapability);
    setSettings(deviceSettings);
    logOptimization(`Initialized for ${metrics.deviceCapability} performance device`);
  }, [metrics.deviceCapability, logOptimization]);

  // Helper functions for components
  const getAnimationProps = useCallback(() => {
    return PerformanceOptimizer.createOptimizedAnimationProps(settings);
  }, [settings]);

  const getParticleConfig = useCallback(() => {
    return PerformanceOptimizer.getParticleConfig(settings);
  }, [settings]);

  const getBlurClasses = useCallback(() => {
    return PerformanceOptimizer.getBlurClasses(settings);
  }, [settings]);

  const getShadowClasses = useCallback(() => {
    return PerformanceOptimizer.getShadowClasses(settings);
  }, [settings]);

  const shouldEnableFeature = useCallback((feature: keyof AnimationComplexitySettings) => {
    return settings[feature];
  }, [settings]);

  return {
    // Current state
    settings,
    isOptimizing,
    optimizationLog,
    
    // Performance metrics
    metrics,
    
    // Control functions
    manualOptimize,
    resetOptimizations,
    updateUserPreferences,
    
    // Helper functions
    getAnimationProps,
    getParticleConfig,
    getBlurClasses,
    getShadowClasses,
    shouldEnableFeature,
    
    // Optimization history
    optimizationHistory: performanceOptimizer.getOptimizationHistory(),
    appliedOptimizations: performanceOptimizer.getAppliedOptimizations()
  };
};