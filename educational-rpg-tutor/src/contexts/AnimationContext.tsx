/**
 * Animation Context Provider
 * Manages global animation state, performance monitoring, and device adaptation
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { 
  AnimationState, 
  AnimationQueueItem, 
  PerformanceMetrics, 
  DeviceCapability,
  AnimationContext as AnimationContextType 
} from '../types/animation';
import { PerformanceMonitor, DeviceCapabilityDetector } from '../utils/performance';
import { AdvancedDeviceDetector } from '../utils/deviceCapability';

// Animation state reducer
type AnimationAction =
  | { type: 'ADD_TO_QUEUE'; payload: Omit<AnimationQueueItem, 'id'> }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<PerformanceMetrics> }
  | { type: 'SET_DEVICE_CAPABILITY'; payload: DeviceCapability }
  | { type: 'SET_ANIMATING'; payload: boolean }
  | { type: 'SET_CURRENT_ANIMATION'; payload: string | null };

const initialState: AnimationState = {
  isAnimating: false,
  currentAnimation: null,
  queue: [],
  performance: {
    fps: 60,
    frameDrops: 0,
    memoryUsage: 0,
    averageFrameTime: 16.67,
    lastMeasurement: performance.now(),
    isThrottled: false,
  },
  deviceCapability: 'medium',
};

function animationReducer(state: AnimationState, action: AnimationAction): AnimationState {
  switch (action.type) {
    case 'ADD_TO_QUEUE':
      const newItem: AnimationQueueItem = {
        ...action.payload,
        id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      return {
        ...state,
        queue: [...state.queue, newItem].sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
      };

    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter(item => item.id !== action.payload),
      };

    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
        isAnimating: false,
        currentAnimation: null,
      };

    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload },
      };

    case 'SET_DEVICE_CAPABILITY':
      return {
        ...state,
        deviceCapability: action.payload,
      };

    case 'SET_ANIMATING':
      return {
        ...state,
        isAnimating: action.payload,
      };

    case 'SET_CURRENT_ANIMATION':
      return {
        ...state,
        currentAnimation: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const AnimationContext = createContext<AnimationContextType | null>(null);

// Provider component
interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  // Initialize performance monitoring and device detection
  useEffect(() => {
    const performanceMonitor = PerformanceMonitor.getInstance();
    const deviceDetector = AdvancedDeviceDetector.getInstance();

    // Start performance monitoring
    performanceMonitor.startMonitoring();

    // Subscribe to performance updates
    const unsubscribe = performanceMonitor.subscribe((metrics) => {
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: metrics });
    });

    // Detect device capability
    const detectCapability = async () => {
      const deviceInfo = await deviceDetector.detectDevice();
      dispatch({ type: 'SET_DEVICE_CAPABILITY', payload: deviceInfo.capability });
    };

    detectCapability();

    // Cleanup
    return () => {
      performanceMonitor.stopMonitoring();
      unsubscribe();
    };
  }, []);

  // Auto-throttle animations based on performance
  useEffect(() => {
    if (state.performance.isThrottled && state.queue.length > 5) {
      // Remove low priority animations when performance is poor
      const filteredQueue = state.queue.filter(item => item.priority !== 'low');
      if (filteredQueue.length !== state.queue.length) {
        dispatch({ type: 'CLEAR_QUEUE' });
        filteredQueue.forEach(item => {
          dispatch({ type: 'ADD_TO_QUEUE', payload: item });
        });
      }
    }
  }, [state.performance.isThrottled, state.queue.length]);

  // Context value
  const contextValue: AnimationContextType = {
    state,
    addToQueue: useCallback((item: Omit<AnimationQueueItem, 'id'>) => {
      dispatch({ type: 'ADD_TO_QUEUE', payload: item });
    }, []),
    removeFromQueue: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_FROM_QUEUE', payload: id });
    }, []),
    clearQueue: useCallback(() => {
      dispatch({ type: 'CLEAR_QUEUE' });
    }, []),
    updatePerformance: useCallback((metrics: Partial<PerformanceMetrics>) => {
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: metrics });
    }, []),
    setDeviceCapability: useCallback((capability: DeviceCapability) => {
      dispatch({ type: 'SET_DEVICE_CAPABILITY', payload: capability });
    }, []),
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Hook to use animation context
export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

// Hook for performance-aware animations
export const usePerformanceAwareAnimation = () => {
  const { state, addToQueue } = useAnimation();

  const createAnimation = useCallback((
    baseConfig: Omit<AnimationQueueItem, 'id'>,
    performanceAware = true
  ) => {
    if (!performanceAware) {
      addToQueue(baseConfig);
      return;
    }

    // Adjust animation based on device capability and current performance
    let adjustedConfig = { ...baseConfig };

    if (state.deviceCapability === 'low' || state.performance.isThrottled) {
      // Reduce animation duration and complexity
      adjustedConfig.duration = Math.max(adjustedConfig.duration * 0.6, 100);
      
      // Skip non-essential animations
      if (adjustedConfig.priority === 'low' && state.performance.fps < 30) {
        return;
      }
    }

    addToQueue(adjustedConfig);
  }, [state.deviceCapability, state.performance, addToQueue]);

  return {
    createAnimation,
    performance: state.performance,
    deviceCapability: state.deviceCapability,
    isThrottled: state.performance.isThrottled,
  };
};

// Hook for device-specific configurations
export const useDeviceAdaptation = () => {
  const { state } = useAnimation();
  const [adaptiveConfig, setAdaptiveConfig] = React.useState<import('../utils/deviceCapability').AdaptiveConfig | null>(null);

  useEffect(() => {
    const deviceDetector = AdvancedDeviceDetector.getInstance();
    const config = deviceDetector.getAdaptiveConfig(state.deviceCapability);
    setAdaptiveConfig(config);
  }, [state.deviceCapability]);

  return {
    deviceCapability: state.deviceCapability,
    adaptiveConfig,
    shouldReduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
};