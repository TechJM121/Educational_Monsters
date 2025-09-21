import { useState, useEffect, useCallback } from 'react';
import { 
  DeviceCapabilities, 
  AnimationPreset,
  deviceCapabilityDetector 
} from '../utils/deviceCapabilityDetector';

export interface DeviceCapabilityConfig {
  enableAutoDetection: boolean;
  enableBatteryOptimization: boolean;
  enableNetworkOptimization: boolean;
  userPreferences?: Partial<AnimationPreset>;
  onCapabilitiesDetected?: (capabilities: DeviceCapabilities) => void;
  onPresetChanged?: (preset: AnimationPreset) => void;
}

const DEFAULT_CONFIG: DeviceCapabilityConfig = {
  enableAutoDetection: true,
  enableBatteryOptimization: true,
  enableNetworkOptimization: true
};

export const useDeviceCapabilities = (config: Partial<DeviceCapabilityConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [animationPreset, setAnimationPreset] = useState<AnimationPreset | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [lastDetection, setLastDetection] = useState<number>(0);

  const detectCapabilities = useCallback(async (force = false) => {
    if (isDetecting && !force) return;
    
    setIsDetecting(true);
    setDetectionError(null);
    
    try {
      const detectedCapabilities = force 
        ? await deviceCapabilityDetector.redetectCapabilities()
        : await deviceCapabilityDetector.detectCapabilities();
      
      setCapabilities(detectedCapabilities);
      setLastDetection(Date.now());
      
      // Generate animation preset
      let preset = deviceCapabilityDetector.getAnimationPreset(detectedCapabilities);
      
      // Apply user preferences if provided
      if (finalConfig.userPreferences) {
        preset = deviceCapabilityDetector.applyUserPreferences(preset, finalConfig.userPreferences);
      }
      
      setAnimationPreset(preset);
      
      // Notify callbacks
      if (finalConfig.onCapabilitiesDetected) {
        finalConfig.onCapabilitiesDetected(detectedCapabilities);
      }
      
      if (finalConfig.onPresetChanged) {
        finalConfig.onPresetChanged(preset);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown detection error';
      setDetectionError(errorMessage);
      console.error('Device capability detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  }, [isDetecting, finalConfig]);

  const updateUserPreferences = useCallback((preferences: Partial<AnimationPreset>) => {
    if (!capabilities || !animationPreset) return;
    
    const updatedPreset = deviceCapabilityDetector.applyUserPreferences(
      animationPreset,
      preferences
    );
    
    setAnimationPreset(updatedPreset);
    
    if (finalConfig.onPresetChanged) {
      finalConfig.onPresetChanged(updatedPreset);
    }
  }, [capabilities, animationPreset, finalConfig]);

  const getOptimizedSettings = useCallback(() => {
    if (!animationPreset) return null;
    
    return {
      // Framer Motion settings
      motionConfig: {
        transition: {
          duration: animationPreset.transitionDuration / 1000,
          ease: animationPreset.enableGPUAcceleration ? 'easeOut' : 'linear'
        },
        style: {
          willChange: animationPreset.enableGPUAcceleration ? 'transform, opacity' : 'auto',
          transform: animationPreset.enable3DTransforms ? 'translateZ(0)' : undefined
        }
      },
      
      // CSS classes
      blurClasses: {
        full: 'backdrop-blur-md',
        reduced: 'backdrop-blur-sm',
        disabled: ''
      }[animationPreset.blurEffects],
      
      shadowClasses: {
        full: 'shadow-2xl',
        reduced: 'shadow-lg',
        disabled: 'shadow-none'
      }[animationPreset.shadowEffects],
      
      // Particle system config
      particleConfig: {
        count: animationPreset.particleCount,
        enablePhysics: animationPreset.enableGPUAcceleration,
        enableInteraction: animationPreset.enable3DTransforms,
        animationDuration: animationPreset.transitionDuration
      },
      
      // Feature flags
      features: {
        enableParallax: animationPreset.enableParallax,
        enableComplexAnimations: animationPreset.enableComplexAnimations,
        enable3DTransforms: animationPreset.enable3DTransforms,
        enableGPUAcceleration: animationPreset.enableGPUAcceleration
      }
    };
  }, [animationPreset]);

  const shouldReduceAnimations = useCallback(() => {
    if (!capabilities) return false;
    
    const conditions = [];
    
    // Battery optimization
    if (finalConfig.enableBatteryOptimization) {
      const lowBattery = capabilities.battery.level < 0.2 && !capabilities.battery.charging;
      conditions.push(lowBattery);
    }
    
    // Network optimization
    if (finalConfig.enableNetworkOptimization) {
      const slowNetwork = capabilities.network.effectiveType === '2g' || 
                          capabilities.network.effectiveType === 'slow-2g';
      const dataSaver = capabilities.network.saveData;
      conditions.push(slowNetwork || dataSaver);
    }
    
    // Performance-based
    const lowPerformance = capabilities.score < 30;
    conditions.push(lowPerformance);
    
    return conditions.some(condition => condition);
  }, [capabilities, finalConfig]);

  const getDeviceInfo = useCallback(() => {
    if (!capabilities) return null;
    
    return {
      tier: capabilities.tier,
      score: capabilities.score,
      memory: capabilities.memory,
      cores: capabilities.cores,
      gpu: {
        vendor: capabilities.gpu.vendor,
        renderer: capabilities.gpu.renderer,
        isDedicated: capabilities.gpu.isDedicated,
        webglVersion: capabilities.gpu.webglVersion
      },
      screen: {
        resolution: `${capabilities.screen.width}x${capabilities.screen.height}`,
        pixelRatio: capabilities.screen.pixelRatio,
        isHighDPI: capabilities.screen.isHighDPI,
        refreshRate: capabilities.screen.refreshRate
      },
      features: capabilities.features,
      battery: capabilities.battery,
      network: capabilities.network
    };
  }, [capabilities]);

  // Auto-detection on mount
  useEffect(() => {
    if (finalConfig.enableAutoDetection) {
      detectCapabilities();
    }
  }, [finalConfig.enableAutoDetection, detectCapabilities]);

  // Battery level monitoring
  useEffect(() => {
    if (!finalConfig.enableBatteryOptimization || !capabilities) return;
    
    const handleBatteryChange = () => {
      // Re-evaluate preset when battery status changes significantly
      if (capabilities.battery.level < 0.2 || capabilities.battery.charging) {
        detectCapabilities();
      }
    };
    
    // Listen for battery events if available
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', handleBatteryChange);
        battery.addEventListener('chargingchange', handleBatteryChange);
        
        return () => {
          battery.removeEventListener('levelchange', handleBatteryChange);
          battery.removeEventListener('chargingchange', handleBatteryChange);
        };
      }).catch(() => {
        // Battery API not available
      });
    }
  }, [capabilities, finalConfig.enableBatteryOptimization, detectCapabilities]);

  // Network change monitoring
  useEffect(() => {
    if (!finalConfig.enableNetworkOptimization) return;
    
    const handleNetworkChange = () => {
      // Re-evaluate preset when network conditions change
      detectCapabilities();
    };
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', handleNetworkChange);
      
      return () => {
        connection.removeEventListener('change', handleNetworkChange);
      };
    }
  }, [finalConfig.enableNetworkOptimization, detectCapabilities]);

  return {
    // Current state
    capabilities,
    animationPreset,
    isDetecting,
    detectionError,
    lastDetection,
    
    // Actions
    detectCapabilities,
    updateUserPreferences,
    
    // Computed values
    optimizedSettings: getOptimizedSettings(),
    shouldReduceAnimations: shouldReduceAnimations(),
    deviceInfo: getDeviceInfo(),
    
    // Utility functions
    isHighEndDevice: capabilities?.tier === 'high',
    isMediumEndDevice: capabilities?.tier === 'medium',
    isLowEndDevice: capabilities?.tier === 'low',
    hasGPUAcceleration: capabilities?.gpu.isDedicated || false,
    hasTouchSupport: capabilities?.features.touchSupport || false,
    hasWebGL2: capabilities?.features.webgl2 || false,
    
    // Performance indicators
    performanceScore: capabilities?.score || 0,
    memoryGB: capabilities?.memory || 0,
    cpuCores: capabilities?.cores || 0
  };
};