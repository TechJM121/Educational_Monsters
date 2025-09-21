import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAnimationOptimization } from '../useAnimationOptimization';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

// Mock the performance monitor hook
vi.mock('../usePerformanceMonitor');
const mockUsePerformanceMonitor = usePerformanceMonitor as vi.MockedFunction<typeof usePerformanceMonitor>;

// Mock the performance optimizer
vi.mock('../../utils/performanceOptimizer', () => ({
  performanceOptimizer: {
    getSettingsForDevice: vi.fn(() => ({
      particleCount: 150,
      blurEffects: 'full',
      shadowEffects: 'full',
      transitionDuration: 300,
      enableGPUAcceleration: true,
      enable3DTransforms: true,
      enableParallax: true
    })),
    optimizeBasedOnMetrics: vi.fn((metrics) => ({
      particleCount: metrics.fps < 45 ? 75 : 150,
      blurEffects: metrics.fps < 40 ? 'disabled' : 'full',
      shadowEffects: 'full',
      transitionDuration: 300,
      enableGPUAcceleration: true,
      enable3DTransforms: true,
      enableParallax: true
    })),
    getCurrentSettings: vi.fn(() => ({
      particleCount: 150,
      blurEffects: 'full',
      shadowEffects: 'full',
      transitionDuration: 300,
      enableGPUAcceleration: true,
      enable3DTransforms: true,
      enableParallax: true
    })),
    getAppliedOptimizations: vi.fn(() => []),
    getOptimizationHistory: vi.fn(() => []),
    resetOptimizations: vi.fn()
  },
  PerformanceOptimizer: {
    createOptimizedAnimationProps: vi.fn(() => ({
      transition: { duration: 0.3, ease: 'easeOut' },
      style: { willChange: 'transform, opacity', transform: 'translateZ(0)' }
    })),
    getParticleConfig: vi.fn(() => ({
      count: 150,
      enablePhysics: true,
      enableInteraction: true,
      animationDuration: 300
    })),
    getBlurClasses: vi.fn(() => 'backdrop-blur-md'),
    getShadowClasses: vi.fn(() => 'shadow-2xl')
  }
}));

describe('useAnimationOptimization', () => {
  const mockMetrics = {
    fps: 60,
    averageFPS: 60,
    frameDrops: 0,
    memoryUsage: 50,
    animationDuration: 16,
    isPerformanceGood: true,
    deviceCapability: 'high' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePerformanceMonitor.mockReturnValue({
      metrics: mockMetrics,
      resetMetrics: vi.fn(),
      measureAnimation: vi.fn(),
      thresholds: {
        minFPS: 55,
        maxFrameDrops: 5,
        maxMemoryUsage: 100,
        maxAnimationDuration: 16.67
      }
    });
  });

  it('should initialize with device-appropriate settings', () => {
    const { result } = renderHook(() => useAnimationOptimization());
    
    expect(result.current.settings.particleCount).toBe(150);
    expect(result.current.settings.blurEffects).toBe('full');
    expect(result.current.isOptimizing).toBe(false);
  });

  it('should apply optimizations automatically when performance degrades', async () => {
    // Mock poor performance
    const poorMetrics = {
      ...mockMetrics,
      fps: 40,
      frameDrops: 10,
      isPerformanceGood: false
    };

    mockUsePerformanceMonitor.mockReturnValue({
      metrics: poorMetrics,
      resetMetrics: vi.fn(),
      measureAnimation: vi.fn(),
      thresholds: {
        minFPS: 55,
        maxFrameDrops: 5,
        maxMemoryUsage: 100,
        maxAnimationDuration: 16.67
      }
    });

    const { result } = renderHook(() => 
      useAnimationOptimization({ optimizationInterval: 100 })
    );

    // Wait for auto-optimization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.settings.particleCount).toBe(75); // Reduced due to poor FPS
  });

  it('should handle manual optimization', () => {
    const { result } = renderHook(() => useAnimationOptimization());
    
    act(() => {
      result.current.manualOptimize();
    });
    
    expect(result.current.optimizationLog.length).toBeGreaterThan(0);
  });

  it('should reset optimizations correctly', () => {
    const { result } = renderHook(() => useAnimationOptimization());
    
    act(() => {
      result.current.resetOptimizations();
    });
    
    expect(result.current.optimizationLog).toContain(
      expect.stringContaining('Optimizations manually reset')
    );
  });

  it('should update user preferences', () => {
    const { result } = renderHook(() => useAnimationOptimization());
    
    const newPreferences = {
      particleCount: 100,
      blurEffects: 'reduced' as const
    };
    
    act(() => {
      result.current.updateUserPreferences(newPreferences);
    });
    
    expect(result.current.settings.particleCount).toBe(100);
    expect(result.current.settings.blurEffects).toBe('reduced');
    expect(result.current.optimizationLog).toContain(
      expect.stringContaining('User preferences updated')
    );
  });

  it('should provide helper functions', () => {
    const { result } = renderHook(() => useAnimationOptimization());
    
    const animationProps = result.current.getAnimationProps();
    expect(animationProps.transition.duration).toBe(0.3);
    
    const particleConfig = result.current.getParticleConfig();
    expect(particleConfig.count).toBe(150);
    
    const blurClasses = result.current.getBlurClasses();
    expect(blurClasses).toBe('backdrop-blur-md');
    
    const shadowClasses = result.current.getShadowClasses();
    expect(shadowClasses).toBe('shadow-2xl');
    
    const shouldEnable3D = result.current.shouldEnableFeature('enable3DTransforms');
    expect(shouldEnable3D).toBe(true);
  });

  it('should disable auto-optimization when configured', () => {
    const { result } = renderHook(() => 
      useAnimationOptimization({ enableAutoOptimization: false })
    );
    
    // Should not trigger optimizations automatically
    expect(result.current.isOptimizing).toBe(false);
  });

  it('should handle user preferences in configuration', () => {
    const userPreferences = {
      particleCount: 50,
      enableParallax: false
    };
    
    const { result } = renderHook(() => 
      useAnimationOptimization({ userPreferences })
    );
    
    // User preferences should be applied
    expect(result.current.settings.particleCount).toBe(50);
    expect(result.current.settings.enableParallax).toBe(false);
  });

  it('should maintain optimization log with timestamps', () => {
    const { result } = renderHook(() => useAnimationOptimization());
    
    act(() => {
      result.current.manualOptimize();
    });
    
    const log = result.current.optimizationLog;
    expect(log.length).toBeGreaterThan(0);
    expect(log[0]).toMatch(/^\d{1,2}:\d{2}:\d{2}:/); // Timestamp format
  });

  it('should limit optimization log entries', () => {
    const { result } = renderHook(() => useAnimationOptimization());
    
    // Add more than 10 log entries
    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.manualOptimize();
      }
    });
    
    // Should keep only last 10 entries
    expect(result.current.optimizationLog.length).toBeLessThanOrEqual(10);
  });

  it('should handle optimization errors gracefully', async () => {
    // Mock an error in the optimizer
    const { performanceOptimizer } = require('../../utils/performanceOptimizer');
    performanceOptimizer.optimizeBasedOnMetrics.mockImplementation(() => {
      throw new Error('Optimization failed');
    });
    
    const { result } = renderHook(() => useAnimationOptimization());
    
    await act(async () => {
      result.current.manualOptimize();
    });
    
    expect(result.current.optimizationLog).toContain(
      expect.stringContaining('Optimization error')
    );
    expect(result.current.isOptimizing).toBe(false);
  });

  it('should cleanup intervals on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => 
      useAnimationOptimization({ optimizationInterval: 1000 })
    );
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    clearIntervalSpy.mockRestore();
  });
});